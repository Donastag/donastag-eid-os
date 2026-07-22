import os
import json
import logging
from typing import Any, Optional
import asyncpg
import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(title="Engineering Intelligence Director", version="0.1.0")

PG_DSN = os.getenv(
    "PG_DSN",
    f"postgresql://{os.getenv('POSTGRES_USER', 'donastag')}:{os.getenv('POSTGRES_PASSWORD', 'postgres')}@{os.getenv('POSTGRES_HOST', 'postgres')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'donastag')}",
)
AI_ROUTER_URL = os.getenv("AI_ROUTER_URL", "http://localhost:8001")


class DirectorRequest(BaseModel):
    capability: Optional[str] = None
    action: Optional[str] = None
    prompt: str
    metadata: Optional[dict[str, Any]] = None


async def get_policy(capability: str, action: str) -> dict[str, Any]:
    conn = await asyncpg.connect(PG_DSN)
    try:
        row = await conn.fetchrow(
            "SELECT requires_human_approval, reason FROM policy_rules WHERE capability=$1 AND action=$2",
            capability,
            action,
        )
        if row:
            return {"requires_human_approval": row["requires_human_approval"], "reason": row["reason"]}
        return {"requires_human_approval": True, "reason": "No explicit policy rule found"}
    finally:
        await conn.close()


async def route_request(prompt: str, capability: Optional[str], action: Optional[str]) -> dict[str, Any]:
    capability = capability or "default"
    action = action or "default"
    policy = await get_policy(capability, action)
    if policy.get("requires_human_approval"):
        return {
            "capability": capability,
            "action": action,
            "allowed": False,
            "reason": policy.get("reason"),
            "response": None,
        }

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            f"{AI_ROUTER_URL}/v1/chat/completions",
            json={
                "model": "claude",
                "messages": [{"role": "user", "content": prompt}],
            },
        )
    if resp.status_code != 200:
        return {
            "capability": capability,
            "action": action,
            "allowed": False,
            "reason": f"AI Router returned {resp.status_code}",
            "response": None,
        }
    data = resp.json()
    return {
        "capability": capability,
        "action": action,
        "allowed": True,
        "reason": policy.get("reason"),
        "response": data.get("choices", [{}])[0].get("message", {}).get("content"),
    }


@app.post("/direct")
async def direct(request: DirectorRequest):
    result = await route_request(request.prompt, request.capability, request.action)
    return result


@app.get("/health")
async def health():
    return {"status": "ok", "service": "director"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
