import os
import uuid
import json
import re
import urllib.parse
from datetime import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncpg
import httpx

app = FastAPI(title="Project Intake")

DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER', 'donastag')}:{os.getenv('POSTGRES_PASSWORD', 'postgres')}@{os.getenv('POSTGRES_HOST', 'postgres')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'donastag')}"
DIRECTOR_URL = os.getenv("DIRECTOR_URL", "http://localhost:8002")


class ProjectIntake(BaseModel):
    name: str
    description: str = ""
    requirements: dict = {}
    tech_stack: dict = {}
    constraints: dict = {}
    timeline_weeks: int | None = None


class LessonLearned(BaseModel):
    project_id: str
    phase: str
    title: str
    body: str
    tags: list[str] = []
    metadata: dict = {}


class ApproveReject(BaseModel):
    reason: str | None = None


class CapabilityConstraint(BaseModel):
    capability_name: str
    constraint_type: str
    detail: str
    affected_version: str | None = None
    severity: str = "warning"
    learned_from_project: str | None = None


@app.get("/health")
async def health():
    return {"status": "ok", "service": "project_intake"}


@app.get("/intakes")
async def list_intakes(limit: int = 50):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        rows = await conn.fetch("SELECT * FROM project_intakes ORDER BY created_at DESC LIMIT $1", limit)
        return [dict(r) for r in rows]
    finally:
        await conn.close()


@app.post("/intakes")
async def create_intake(intake: ProjectIntake):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        row = await conn.fetchrow(
            "INSERT INTO project_intakes (name, description, requirements, tech_stack, constraints, timeline_weeks, status) VALUES ($1, $2, $3, $4, $5, $6, 'intake') RETURNING *",
            intake.name, intake.description, json.dumps(intake.requirements), json.dumps(intake.tech_stack), json.dumps(intake.constraints), intake.timeline_weeks
        )
        return dict(row)
    finally:
        await conn.close()


@app.get("/intakes/{intake_id}")
async def get_intake(intake_id: str):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        row = await conn.fetchrow("SELECT * FROM project_intakes WHERE id = $1", intake_id)
        if not row:
            raise HTTPException(404, "Intake not found")
        return dict(row)
    finally:
        await conn.close()


@app.post("/intakes/{intake_id}/plan")
async def generate_plan(intake_id: str):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        intake_row = await conn.fetchrow("SELECT * FROM project_intakes WHERE id = $1", intake_id)
        if not intake_row:
            raise HTTPException(404, "Intake not found")

        components = await conn.fetch(
            "SELECT name, metadata FROM capabilities WHERE type = 'oss_stack_component' AND status = 'active'"
        )
        available_components = [dict(c) for c in components]

        constraint_rows = await conn.fetch(
            """
            SELECT cc.capability_name, cc.constraint_type, cc.detail, cc.affected_version, cc.severity
            FROM capability_constraints cc
            WHERE cc.capability_name IN (
                SELECT name FROM capabilities WHERE type = 'oss_stack_component' AND status = 'active'
            )
            """
        )
        constraints = [dict(r) for r in constraint_rows]

        valid_names = [c["name"] for c in available_components]
        prompt = (
            "You are a software architect. Generate a project proposal based on the following intake.\n\n"
            "AVAILABLE STACK COMPONENTS (you may ONLY choose from this exact list, do not suggest anything not on it):\n"
            f"{json.dumps(valid_names)}\n\n"
        )
        if constraints:
            prompt += "KNOWN ISSUES AND CONSTRAINTS (you MUST respect these when recommending a stack):\n"
            for c in constraints:
                severity = c.get("severity", "warning").upper()
                version = f" ({c['affected_version']})" if c.get("affected_version") else ""
                prompt += f"- {c['capability_name']}: [{severity}] {c['detail']}{version}\n"
            prompt += "\n"
            prompt += "IMPORTANT: Every value in tech_recommendations MUST be one of the exact names from the AVAILABLE STACK COMPONENTS list above. Do not invent or substitute alternatives.\n\n"
        prompt += (
            f"Project: {intake_row['name']}\n"
            f"Description: {intake_row['description']}\n"
            f"Requirements: {json.dumps(intake_row['requirements'])}\n"
            f"Constraints: {json.dumps(intake_row['constraints'])}\n"
            f"Timeline weeks: {intake_row['timeline_weeks']}\n\n"
            "Return valid JSON with keys: phases (list of {name, weeks, tasks}), "
            "tech_recommendations (dict), risks (list of strings)."
        )

        owner_project = re.sub(r"[^a-z0-9_-]", "-", intake_row["name"].lower())
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{DIRECTOR_URL}/orchestrate",
                json={
                    "prompt": prompt,
                    "capability": "project_intake.generate_plan",
                    "action": "write",
                    "owner_project": owner_project,
                },
            )
        resp.raise_for_status()
        data = resp.json()
        response_text = data.get("response") or ""

        plan_payload = {
            "raw_response": response_text,
            "phases": [],
            "tech_recommendations": {},
            "risks": [],
            "stack_validation": {"valid": True, "unrecognized": []},
        }
        try:
            cleaned = response_text.strip()
            if cleaned.startswith("```"):
                cleaned = re.sub(r"^```(?:json)?\n?", "", cleaned)
                cleaned = re.sub(r"\n?```$", "", cleaned)
            parsed = json.loads(cleaned)
            plan_payload["phases"] = parsed.get("phases", [])
            plan_payload["tech_recommendations"] = parsed.get("tech_recommendations", {})
            plan_payload["risks"] = parsed.get("risks", [])

            recommended_values = [v for v in plan_payload["tech_recommendations"].values() if isinstance(v, str)]
            valid_names_set = set(valid_names)
            unrecognized = [v for v in recommended_values if v not in valid_names_set]
            stack_validation = {
                "valid": not unrecognized,
                "unrecognized": unrecognized,
                "constraint_violations": [],
            }
            if constraints:
                constraints_by_capability = {}
                for c in constraints:
                    constraints_by_capability.setdefault(c["capability_name"], []).append(c)
                for value in recommended_values:
                    for constraint in constraints_by_capability.get(value, []):
                        if constraint.get("severity") == "blocker":
                            stack_validation["constraint_violations"].append({
                                "capability": value,
                                "issue": constraint["detail"],
                                "affected_version": constraint.get("affected_version"),
                            })
                            stack_validation["valid"] = False
            plan_payload["stack_validation"] = stack_validation
        except (json.JSONDecodeError, TypeError):
            pass

        updated = await conn.fetchrow(
            "UPDATE project_intakes SET architectural_plan = $1, status = 'planned' WHERE id = $2 RETURNING *",
            json.dumps(plan_payload),
            intake_id,
        )
        return dict(updated)
    finally:
        await conn.close()


@app.post("/intakes/{intake_id}/approve")
async def approve_intake(intake_id: str, body: ApproveReject | None = None):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        row = await conn.fetchrow("SELECT * FROM project_intakes WHERE id = $1", intake_id)
        if not row:
            raise HTTPException(404, "Intake not found")
        notes = dict(row).get("execution_notes") or {}
        if isinstance(notes, str):
            try:
                notes = json.loads(notes)
            except json.JSONDecodeError:
                notes = {}
        if body and body.reason:
            notes.setdefault("approval_history", []).append({
                "event": "approved",
                "reason": body.reason,
                "at": datetime.utcnow().isoformat(),
            })
        updated = await conn.fetchrow(
            "UPDATE project_intakes SET status = 'approved', execution_notes = $1 WHERE id = $2 RETURNING *",
            json.dumps(notes),
            intake_id,
        )
        return dict(updated)
    finally:
        await conn.close()


@app.post("/intakes/{intake_id}/reject")
async def reject_intake(intake_id: str, body: ApproveReject | None = None):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        row = await conn.fetchrow("SELECT * FROM project_intakes WHERE id = $1", intake_id)
        if not row:
            raise HTTPException(404, "Intake not found")
        notes = dict(row).get("execution_notes") or {}
        if isinstance(notes, str):
            try:
                notes = json.loads(notes)
            except json.JSONDecodeError:
                notes = {}
        if body and body.reason:
            notes.setdefault("approval_history", []).append({
                "event": "rejected",
                "reason": body.reason,
                "at": datetime.utcnow().isoformat(),
            })
        updated = await conn.fetchrow(
            "UPDATE project_intakes SET status = 'rejected', execution_notes = $1 WHERE id = $2 RETURNING *",
            json.dumps(notes),
            intake_id,
        )
        return dict(updated)
    finally:
        await conn.close()


@app.post("/lessons")
async def add_lesson(lesson: LessonLearned):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        row = await conn.fetchrow(
            "INSERT INTO project_lessons (project_id, phase, title, body, tags, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            lesson.project_id, lesson.phase, lesson.title, lesson.body, lesson.tags, json.dumps(lesson.metadata)
        )
        return dict(row)
    finally:
        await conn.close()


@app.get("/lessons")
async def list_lessons(project_id: str | None = None, limit: int = 50):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        if project_id:
            rows = await conn.fetch("SELECT * FROM project_lessons WHERE project_id = $1 ORDER BY created_at DESC LIMIT $2", project_id, limit)
        else:
            rows = await conn.fetch("SELECT * FROM project_lessons ORDER BY created_at DESC LIMIT $1", limit)
        return [dict(r) for r in rows]
    finally:
        await conn.close()


@app.post("/constraints")
async def create_constraint(constraint: CapabilityConstraint):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        row = await conn.fetchrow(
            "INSERT INTO capability_constraints (capability_name, constraint_type, detail, affected_version, severity, learned_from_project) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            constraint.capability_name, constraint.constraint_type, constraint.detail, constraint.affected_version, constraint.severity, constraint.learned_from_project
        )
        return dict(row)
    finally:
        await conn.close()


@app.get("/constraints")
async def list_constraints(capability_name: str | None = None, limit: int = 100):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        if capability_name:
            rows = await conn.fetch(
                "SELECT * FROM capability_constraints WHERE capability_name = $1 ORDER BY created_at DESC LIMIT $2",
                capability_name, limit
            )
        else:
            rows = await conn.fetch("SELECT * FROM capability_constraints ORDER BY created_at DESC LIMIT $1", limit)
        return [dict(r) for r in rows]
    finally:
        await conn.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
