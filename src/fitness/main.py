import os
import json
import logging
from typing import Any
import asyncpg
from fastapi import FastAPI
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(title="Architecture Fitness Functions", version="0.1.0")

PG_DSN = os.getenv(
    "PG_DSN",
    f"postgresql://{os.getenv('POSTGRES_USER', 'donastag')}:{os.getenv('POSTGRES_PASSWORD', 'postgres')}@{os.getenv('POSTGRES_HOST', 'postgres')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'donastag')}",
)


class Rule(BaseModel):
    rule: str
    status: str
    detail: str | None = None
    score_impact: float = 0.0


@app.post("/evaluate")
async def evaluate(rule: Rule):
    conn = await asyncpg.connect(PG_DSN)
    try:
        row = await conn.fetchrow(
            "INSERT INTO architecture_fitness_results (rule, status, detail, score_impact) VALUES ($1, $2, $3, $4) RETURNING id, rule, status, detail, score_impact, created_at",
            rule.rule,
            rule.status,
            rule.detail,
            rule.score_impact,
        )
        return dict(row)
    finally:
        await conn.close()


@app.get("/results")
async def results(limit: int = 50):
    conn = await asyncpg.connect(PG_DSN)
    try:
        rows = await conn.fetch("SELECT id, rule, status, detail, score_impact, created_at FROM architecture_fitness_results ORDER BY created_at DESC LIMIT $1", limit)
        return {"results": [dict(row) for row in rows]}
    finally:
        await conn.close()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "fitness"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
