import os
import json
import logging
from typing import Any
import asyncpg
import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(title="Monitoring", version="0.1.0")

PG_DSN = os.getenv(
    "PG_DSN",
    f"postgresql://{os.getenv('POSTGRES_USER', 'donastag')}:{os.getenv('POSTGRES_PASSWORD', 'postgres')}@{os.getenv('POSTGRES_HOST', 'postgres')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'donastag')}",
)

TARGETS = {
    "postgres": "postgres:5432",
    "redis": "redis:6379",
    "ai_router": "ai_router:8000/health",
    "director": "director:8000/health",
    "verification_engine": "verification_engine:8000/health",
    "security_engine": "security_engine:8000/health",
    "telegram_concierge": "telegram_concierge:8000/health",
    "studio": "studio:3000",
}


class CheckRequest(BaseModel):
    target: str
    url: str | None = None


async def check_target(name: str, address: str) -> dict[str, Any]:
    if not address.startswith("http"):
        address = f"http://{address}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(address)
            return {
                "target": name,
                "status": "up" if resp.status_code == 200 else "degraded",
                "status_code": resp.status_code,
                "detail": resp.text[:200],
            }
        except Exception as e:
            return {
                "target": name,
                "status": "down",
                "status_code": None,
                "detail": str(e),
            }


@app.post("/check")
async def run_check(request: CheckRequest):
    if request.target not in TARGETS:
        raise HTTPException(status_code=404, detail="Unknown target")
    address = request.url or TARGETS[request.target]
    result = await check_target(request.target, address)
    conn = await asyncpg.connect(PG_DSN)
    try:
        await conn.execute(
            "INSERT INTO checks (target, status, status_code, detail) VALUES ($1, $2, $3, $4)",
            result["target"],
            result["status"],
            result["status_code"],
            result["detail"],
        )
    finally:
        await conn.close()
    return result


@app.get("/checks")
async def list_checks(limit: int = 50):
    conn = await asyncpg.connect(PG_DSN)
    try:
        rows = await conn.fetch("SELECT target, status, status_code, detail, created_at FROM checks ORDER BY created_at DESC LIMIT $1", limit)
        return {"checks": [dict(row) for row in rows]}
    finally:
        await conn.close()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "monitoring"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
