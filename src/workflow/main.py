import os
import json
import logging
from datetime import datetime, timezone
from typing import Any
import asyncpg
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(title="Workflow Intelligence", version="0.1.0")

PG_DSN = os.getenv(
    "PG_DSN",
    f"postgresql://{os.getenv('POSTGRES_USER', 'donastag')}:{os.getenv('POSTGRES_PASSWORD', 'postgres')}@{os.getenv('POSTGRES_HOST', 'postgres')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'donastag')}",
)


class WorkflowRun(BaseModel):
    name: str
    input: dict[str, Any] | None = None
    metadata: dict[str, Any] | None = None


class WorkflowEvent(BaseModel):
    run_id: str
    kind: str
    payload: dict[str, Any] | None = None


@app.post("/runs")
async def create_run(run: WorkflowRun):
    conn = await asyncpg.connect(PG_DSN)
    try:
        row = await conn.fetchrow(
            "INSERT INTO workflow_runs (name, input, metadata) VALUES ($1, $2, $3) RETURNING id, name, status, input, output, started_at, finished_at, metadata, created_at, updated_at",
            run.name,
            json.dumps(run.input or {}),
            json.dumps(run.metadata or {}),
        )
        return dict(row)
    finally:
        await conn.close()


@app.post("/runs/{run_id}/events")
async def add_event(run_id: str, event: WorkflowEvent):
    conn = await asyncpg.connect(PG_DSN)
    try:
        row = await conn.fetchrow(
            "INSERT INTO workflow_events (run_id, kind, payload) VALUES ($1::uuid, $2, $3) RETURNING id, run_id, kind, payload, created_at",
            run_id,
            event.kind,
            json.dumps(event.payload or {}),
        )
        if event.kind == "started":
            await conn.execute("UPDATE workflow_runs SET status = 'running', started_at = now() WHERE id = $1::uuid", run_id)
        elif event.kind == "completed":
            await conn.execute("UPDATE workflow_runs SET status = 'completed', finished_at = now() WHERE id = $1::uuid", run_id)
        elif event.kind == "failed":
            await conn.execute("UPDATE workflow_runs SET status = 'failed', finished_at = now() WHERE id = $1::uuid", run_id)
        return dict(row)
    finally:
        await conn.close()


@app.get("/runs")
async def list_runs(limit: int = 50):
    conn = await asyncpg.connect(PG_DSN)
    try:
        rows = await conn.fetch("SELECT id, name, status, input, output, started_at, finished_at, metadata, created_at, updated_at FROM workflow_runs ORDER BY created_at DESC LIMIT $1", limit)
        return {"runs": [dict(row) for row in rows]}
    finally:
        await conn.close()


@app.get("/events")
async def list_events(run_id: str, limit: int = 100):
    conn = await asyncpg.connect(PG_DSN)
    try:
        rows = await conn.fetch("SELECT id, run_id, kind, payload, created_at FROM workflow_events WHERE run_id = $1::uuid ORDER BY created_at DESC LIMIT $2", run_id, limit)
        return {"events": [dict(row) for row in rows]}
    finally:
        await conn.close()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "workflow"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
