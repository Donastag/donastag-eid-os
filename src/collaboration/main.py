import os
import json
import logging
from typing import Any
import asyncpg
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(title="Collaboration Engine", version="0.1.0")

PG_DSN = os.getenv(
    "PG_DSN",
    f"postgresql://{os.getenv('POSTGRES_USER', 'donastag')}:{os.getenv('POSTGRES_PASSWORD', 'postgres')}@{os.getenv('POSTGRES_HOST', 'postgres')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'donastag')}",
)


class Collaborator(BaseModel):
    name: str
    role: str
    email: str | None = None
    metadata: dict[str, Any] | None = None


class Collaboration(BaseModel):
    collaborator_id: str
    asset_id: str
    permission: str = "read"
    metadata: dict[str, Any] | None = None


@app.post("/collaborators")
async def create_collaborator(collaborator: Collaborator):
    conn = await asyncpg.connect(PG_DSN)
    try:
        row = await conn.fetchrow(
            "INSERT INTO collaborators (name, role, email, metadata) VALUES ($1, $2, $3, $4) RETURNING id, name, role, email, metadata, created_at, updated_at",
            collaborator.name,
            collaborator.role,
            collaborator.email,
            json.dumps(collaborator.metadata or {}),
        )
        return dict(row)
    finally:
        await conn.close()


@app.get("/collaborators")
async def list_collaborators(limit: int = 50):
    conn = await asyncpg.connect(PG_DSN)
    try:
        rows = await conn.fetch("SELECT id, name, role, email, metadata, created_at, updated_at FROM collaborators ORDER BY created_at DESC LIMIT $1", limit)
        return {"collaborators": [dict(row) for row in rows]}
    finally:
        await conn.close()


@app.post("/collaborations")
async def create_collaboration(collaboration: Collaboration):
    conn = await asyncpg.connect(PG_DSN)
    try:
        row = await conn.fetchrow(
            "INSERT INTO collaborations (collaborator_id, asset_id, permission, metadata) VALUES ($1::uuid, $2, $3, $4) RETURNING id, collaborator_id, asset_id, permission, metadata, created_at, updated_at",
            collaboration.collaborator_id,
            collaboration.asset_id,
            collaboration.permission,
            json.dumps(collaboration.metadata or {}),
        )
        return dict(row)
    finally:
        await conn.close()


@app.get("/collaborations")
async def list_collaborations(asset_id: str, limit: int = 50):
    conn = await asyncpg.connect(PG_DSN)
    try:
        rows = await conn.fetch(
            "SELECT c.id, c.collaborator_id, c.asset_id, c.permission, c.metadata, c.created_at, c.updated_at, coll.name as collaborator_name FROM collaborations c JOIN collaborators coll ON coll.id = c.collaborator_id WHERE c.asset_id = $1 ORDER BY c.created_at DESC LIMIT $2",
            asset_id,
            limit,
        )
        return {"collaborations": [dict(row) for row in rows]}
    finally:
        await conn.close()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "collaboration"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
