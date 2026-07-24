import os
import uuid
import json
from datetime import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncpg

app = FastAPI(title="Project Intake")

DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER', 'donastag')}:{os.getenv('POSTGRES_PASSWORD', 'postgres')}@{os.getenv('POSTGRES_HOST', 'postgres')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'donastag')}"

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
        row = await conn.fetchrow("SELECT * FROM project_intakes WHERE id = $1", intake_id)
        if not row:
            raise HTTPException(404, "Intake not found")
        plan = {
            "phases": [
                {"name": "Setup", "weeks": 1, "tasks": ["Repo scaffolding", "CI/CD baseline", "Docker compose"]},
                {"name": "Core", "weeks": max(1, (row['timeline_weeks'] or 4) - 2), "tasks": ["API skeleton", "Database schema", "Auth"]},
                {"name": "Polish", "weeks": 1, "tasks": ["Testing", "Documentation", "Deploy"]},
            ],
            "tech_recommendations": row['tech_stack'] or {"backend": "FastAPI", "frontend": "Next.js", "db": "Postgres"},
            "generated_at": datetime.utcnow().isoformat(),
        }
        updated = await conn.fetchrow("UPDATE project_intakes SET architectural_plan = $1, status = 'planned' WHERE id = $2 RETURNING *", json.dumps(plan), intake_id)
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
