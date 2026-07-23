import os
import json
import logging
from typing import Any
import asyncpg
from fastapi import FastAPI
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(title="Engineering Score", version="0.1.0")

PG_DSN = os.getenv(
    "PG_DSN",
    f"postgresql://{os.getenv('POSTGRES_USER', 'donastag')}:{os.getenv('POSTGRES_PASSWORD', 'postgres')}@{os.getenv('POSTGRES_HOST', 'postgres')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'donastag')}",
)

WEIGHTS = {
    "verification_coverage": 0.25,
    "security_posture": 0.25,
    "workflow_success_rate": 0.25,
    "knowledge_graph_density": 0.15,
    "inbox_resolution_rate": 0.10,
}


async def get_metric(conn, query, default=0.0):
    row = await conn.fetchrow(query)
    return float(row["value"]) if row and row["value"] is not None else default


@app.get("/compute")
async def compute_score():
    conn = await asyncpg.connect(PG_DSN)
    try:
        verification_coverage = await get_metric(conn, "SELECT COALESCE(COUNT(*) FILTER (WHERE status = 'completed'), 0)::float / NULLIF(COUNT(*), 0) AS value FROM verifications")
        security_posture = await get_metric(conn, "SELECT COALESCE(SUM((severity = 'low')::int) * 0.2 + SUM((severity = 'medium')::int) * 0.5 + SUM((severity = 'high')::int) * 1.0, 0) / NULLIF(COUNT(*), 0) AS value FROM vulnerability_findings")
        security_posture = max(0.0, 1.0 - security_posture)
        workflow_success_rate = await get_metric(conn, "SELECT COALESCE(COUNT(*) FILTER (WHERE status = 'completed'), 0)::float / NULLIF(COUNT(*), 0) AS value FROM workflow_runs")
        knowledge_graph_density = await get_metric(conn, "SELECT COALESCE(COUNT(*), 0)::float / NULLIF(COUNT(*) FILTER (WHERE kind != ''), 0) AS value FROM kg_entities")
        inbox_resolution_rate = await get_metric(conn, "SELECT COALESCE(COUNT(*) FILTER (WHERE status != 'open'), 0)::float / NULLIF(COUNT(*), 0) AS value FROM inbox")

        breakdown = {
            "verification_coverage": verification_coverage,
            "security_posture": security_posture,
            "workflow_success_rate": workflow_success_rate,
            "knowledge_graph_density": knowledge_graph_density,
            "inbox_resolution_rate": inbox_resolution_rate,
        }

        overall = sum(breakdown[k] * WEIGHTS[k] for k in breakdown)

        await conn.execute(
            "INSERT INTO engineering_scores (overall, breakdown) VALUES ($1, $2)",
            overall,
            json.dumps(breakdown),
        )

        return {"overall": overall, "breakdown": breakdown}
    finally:
        await conn.close()


@app.get("/latest")
async def latest_score():
    conn = await asyncpg.connect(PG_DSN)
    try:
        row = await conn.fetchrow("SELECT overall, breakdown, computed_at FROM engineering_scores ORDER BY computed_at DESC LIMIT 1")
        return dict(row) if row else {"overall": 0.0, "breakdown": {}, "computed_at": None}
    finally:
        await conn.close()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "score"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
