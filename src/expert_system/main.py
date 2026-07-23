import os
import json
import logging
from typing import Any
import asyncpg
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(title="Expert System", version="0.1.0")

PG_DSN = os.getenv(
    "PG_DSN",
    f"postgresql://{os.getenv('POSTGRES_USER', 'donastag')}:{os.getenv('POSTGRES_PASSWORD', 'postgres')}@{os.getenv('POSTGRES_HOST', 'postgres')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'donastag')}",
)


class Expert(BaseModel):
    name: str
    domain: str
    description: str
    metadata: dict[str, Any] | None = None


class Consultation(BaseModel):
    expert_id: str
    question: str
    answer: str | None = None
    status: str = "pending"
    metadata: dict[str, Any] | None = None


@app.post("/experts")
async def create_expert(expert: Expert):
    conn = await asyncpg.connect(PG_DSN)
    try:
        row = await conn.fetchrow(
            "INSERT INTO experts (name, domain, description, metadata) VALUES ($1, $2, $3, $4) RETURNING id, name, domain, description, metadata, created_at, updated_at",
            expert.name,
            expert.domain,
            expert.description,
            json.dumps(expert.metadata or {}),
        )
        return dict(row)
    finally:
        await conn.close()


@app.get("/experts")
async def list_experts(limit: int = 50):
    conn = await asyncpg.connect(PG_DSN)
    try:
        rows = await conn.fetch("SELECT id, name, domain, description, metadata, created_at, updated_at FROM experts ORDER BY created_at DESC LIMIT $1", limit)
        return {"experts": [dict(row) for row in rows]}
    finally:
        await conn.close()


@app.post("/consultations")
async def create_consultation(consultation: Consultation):
    conn = await asyncpg.connect(PG_DSN)
    try:
        row = await conn.fetchrow(
            "INSERT INTO expert_consultations (expert_id, question, answer, status, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING id, expert_id, question, answer, status, metadata, created_at, updated_at",
            consultation.expert_id,
            consultation.question,
            consultation.answer,
            consultation.status,
            json.dumps(consultation.metadata or {}),
        )
        return dict(row)
    finally:
        await conn.close()


@app.get("/consultations")
async def list_consultations(limit: int = 50):
    conn = await asyncpg.connect(PG_DSN)
    try:
        rows = await conn.fetch("SELECT id, expert_id, question, answer, status, metadata, created_at, updated_at FROM expert_consultations ORDER BY created_at DESC LIMIT $1", limit)
        return {"consultations": [dict(row) for row in rows]}
    finally:
        await conn.close()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "expert_system"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
