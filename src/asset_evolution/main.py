import os
import json
import logging
from typing import Any
import asyncpg
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(title="Asset Evolution Engine", version="0.1.0")

PG_DSN = os.getenv(
    "PG_DSN",
    f"postgresql://{os.getenv('POSTGRES_USER', 'donastag')}:{os.getenv('POSTGRES_PASSWORD', 'postgres')}@{os.getenv('POSTGRES_HOST', 'postgres')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'donastag')}",
)


class AssetVersion(BaseModel):
    asset_id: str
    version: str
    metadata: dict[str, Any] | None = None


class AssetEvent(BaseModel):
    asset_id: str
    from_version: str | None = None
    to_version: str
    kind: str
    payload: dict[str, Any] | None = None


@app.post("/versions")
async def create_version(version: AssetVersion):
    conn = await asyncpg.connect(PG_DSN)
    try:
        row = await conn.fetchrow(
            "INSERT INTO asset_versions (asset_id, version, metadata) VALUES ($1, $2, $3) RETURNING id, asset_id, version, metadata, created_at, updated_at",
            version.asset_id,
            version.version,
            json.dumps(version.metadata or {}),
        )
        return dict(row)
    finally:
        await conn.close()


@app.get("/versions")
async def list_versions(asset_id: str, limit: int = 50):
    conn = await asyncpg.connect(PG_DSN)
    try:
        rows = await conn.fetch("SELECT id, asset_id, version, metadata, created_at, updated_at FROM asset_versions WHERE asset_id = $1 ORDER BY created_at DESC LIMIT $2", asset_id, limit)
        return {"versions": [dict(row) for row in rows]}
    finally:
        await conn.close()


@app.post("/events")
async def create_event(event: AssetEvent):
    conn = await asyncpg.connect(PG_DSN)
    try:
        row = await conn.fetchrow(
            "INSERT INTO asset_evolution_events (asset_id, from_version, to_version, kind, payload) VALUES ($1, $2, $3, $4, $5) RETURNING id, asset_id, from_version, to_version, kind, payload, created_at",
            event.asset_id,
            event.from_version,
            event.to_version,
            event.kind,
            json.dumps(event.payload or {}),
        )
        return dict(row)
    finally:
        await conn.close()


@app.get("/events")
async def list_events(asset_id: str, limit: int = 50):
    conn = await asyncpg.connect(PG_DSN)
    try:
        rows = await conn.fetch("SELECT id, asset_id, from_version, to_version, kind, payload, created_at FROM asset_evolution_events WHERE asset_id = $1 ORDER BY created_at DESC LIMIT $2", asset_id, limit)
        return {"events": [dict(row) for row in rows]}
    finally:
        await conn.close()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "asset_evolution"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
