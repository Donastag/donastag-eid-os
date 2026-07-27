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

        prompt = (
            "You are a software architect. Generate a project proposal based on the following intake.\n"
            f"Project: {intake_row['name']}\n"
            f"Description: {intake_row['description']}\n"
            f"Requirements: {json.dumps(intake_row['requirements'])}\n"
            f"Constraints: {json.dumps(intake_row['constraints'])}\n"
            f"Timeline weeks: {intake_row['timeline_weeks']}\n"
            f"Available stack components (must only recommend from this list): {json.dumps(available_components)}\n\n"
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
