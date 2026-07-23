import os
import json
import logging
from typing import Any
import asyncpg
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(title="Knowledge Graph", version="0.1.0")

PG_DSN = os.getenv(
    "PG_DSN",
    f"postgresql://{os.getenv('POSTGRES_USER', 'donastag')}:{os.getenv('POSTGRES_PASSWORD', 'postgres')}@{os.getenv('POSTGRES_HOST', 'postgres')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'donastag')}",
)


class Entity(BaseModel):
    kind: str
    name: str
    data: dict[str, Any] | None = None


class Relation(BaseModel):
    source_id: str
    target_id: str
    kind: str
    data: dict[str, Any] | None = None


@app.post("/entities")
async def create_entity(entity: Entity):
    conn = await asyncpg.connect(PG_DSN)
    try:
        row = await conn.fetchrow("INSERT INTO kg_entities (kind, name, data) VALUES ($1, $2, $3) RETURNING id, kind, name, data, created_at, updated_at", entity.kind, entity.name, json.dumps(entity.data or {}))
        return dict(row)
    finally:
        await conn.close()


@app.get("/entities")
async def list_entities(limit: int = 100):
    conn = await asyncpg.connect(PG_DSN)
    try:
        rows = await conn.fetch("SELECT id, kind, name, data, created_at, updated_at FROM kg_entities ORDER BY created_at DESC LIMIT $1", limit)
        return {"entities": [dict(row) for row in rows]}
    finally:
        await conn.close()


@app.post("/relations")
async def create_relation(relation: Relation):
    conn = await asyncpg.connect(PG_DSN)
    try:
        row = await conn.fetchrow("INSERT INTO kg_relations (source_id, target_id, kind, data) VALUES ($1::uuid, $2::uuid, $3, $4) RETURNING id, source_id, target_id, kind, data, created_at, updated_at", relation.source_id, relation.target_id, relation.kind, json.dumps(relation.data or {}))
        return dict(row)
    finally:
        await conn.close()


@app.get("/relations")
async def list_relations(limit: int = 100):
    conn = await asyncpg.connect(PG_DSN)
    try:
        rows = await conn.fetch("SELECT id, source_id, target_id, kind, data, created_at, updated_at FROM kg_relations ORDER BY created_at DESC LIMIT $1", limit)
        return {"relations": [dict(row) for row in rows]}
    finally:
        await conn.close()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "kg"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
