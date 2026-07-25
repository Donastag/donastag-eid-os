import os
import json
import logging
from typing import Any, Optional
import asyncpg
import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(title="Engineering Intelligence Director", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PG_DSN = os.getenv(
    "PG_DSN",
    f"postgresql://{os.getenv('POSTGRES_USER', 'donastag')}:{os.getenv('POSTGRES_PASSWORD', 'postgres')}@{os.getenv('POSTGRES_HOST', 'postgres')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'donastag')}",
)
AI_ROUTER_URL = os.getenv("AI_ROUTER_URL", "http://localhost:8001")


class DirectorRequest(BaseModel):
    capability: Optional[str] = None
    action: Optional[str] = None
    prompt: str
    owner_project: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None


class ProjectCreate(BaseModel):
    name: str
    client: Optional[str] = None
    status: Optional[str] = "active"
    metadata: Optional[dict[str, Any]] = None


async def get_policy(capability: str, action: str, owner_project: Optional[str] = None) -> dict[str, Any]:
    conn = await asyncpg.connect(PG_DSN)
    try:
        row = None
        if owner_project:
            row = await conn.fetchrow(
                "SELECT requires_human_approval, reason FROM policy_rules WHERE capability=$1 AND action=$2 AND owner_project=$3",
                capability,
                action,
                owner_project,
            )
        if not row:
            row = await conn.fetchrow(
                "SELECT requires_human_approval, reason FROM policy_rules WHERE capability=$1 AND action=$2 AND owner_project IS NULL",
                capability,
                action,
            )
        if row:
            return {"requires_human_approval": row["requires_human_approval"], "reason": row["reason"]}
        return {"requires_human_approval": True, "reason": "No explicit policy rule found"}
    finally:
        await conn.close()


async def persist_request(*, source: str, capability: Optional[str], action: Optional[str], prompt: str, allowed: bool, reason: Optional[str], response: Optional[str]) -> None:
    conn = await asyncpg.connect(PG_DSN)
    try:
        await conn.execute(
            """
            INSERT INTO requests (source, capability, action, prompt, allowed, reason, response, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            """,
            source,
            capability,
            action,
            prompt,
            allowed,
            reason,
            response,
            json.dumps({}),
        )
    except Exception as e:
        logger.error(f"Failed to persist request: {e}")
    finally:
        await conn.close()


async def route_request(prompt: str, capability: Optional[str], action: Optional[str], owner_project: Optional[str] = None) -> dict[str, Any]:
    capability = capability or "default"
    action = action or "default"
    policy = await get_policy(capability, action, owner_project)
    result: dict[str, Any] = {
        "capability": capability,
        "action": action,
        "owner_project": owner_project,
        "allowed": False,
        "reason": policy.get("reason"),
        "response": None,
    }

    if not policy.get("requires_human_approval"):
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{AI_ROUTER_URL}/v1/chat/completions",
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
        if resp.status_code == 200:
            data = resp.json()
            result = {
                "capability": capability,
                "action": action,
                "owner_project": owner_project,
                "allowed": True,
                "reason": policy.get("reason"),
                "response": data.get("choices", [{}])[0].get("message", {}).get("content"),
            }
        else:
            result["reason"] = f"AI Router returned {resp.status_code}"

    await persist_request(
        source="director",
        capability=capability,
        action=action,
        prompt=prompt,
        allowed=result.get("allowed", False),
        reason=result.get("reason"),
        response=result.get("response"),
    )
    return result


@app.post("/orchestrate")
async def orchestrate(request: DirectorRequest):
    result = await route_request(request.prompt, request.capability, request.action, request.owner_project)
    return result


@app.get("/health")
async def health():
    return {"status": "ok", "service": "director"}


@app.get("/requests")
async def list_requests(limit: int = 50):
    conn = await asyncpg.connect(PG_DSN)
    try:
        rows = await conn.fetch(
            "SELECT id, source, capability, action, prompt, allowed, reason, response, created_at FROM requests ORDER BY created_at DESC LIMIT $1",
            limit,
        )
        return {"requests": [dict(row) for row in rows]}
    finally:
        await conn.close()


@app.post("/projects")
async def create_project(project: ProjectCreate):
    conn = await asyncpg.connect(PG_DSN)
    try:
        row = await conn.fetchrow(
            "INSERT INTO projects (name, client, status, metadata) VALUES ($1, $2, $3, $4) RETURNING id, name, client, status, metadata, created_at, updated_at",
            project.name,
            project.client,
            project.status,
            json.dumps(project.metadata or {}),
        )
        return dict(row)
    finally:
        await conn.close()


@app.get("/projects")
async def list_projects(limit: int = 100):
    conn = await asyncpg.connect(PG_DSN)
    try:
        rows = await conn.fetch(
            "SELECT id, name, client, status, metadata, created_at, updated_at FROM projects ORDER BY created_at DESC LIMIT $1",
            limit,
        )
        return {"projects": [dict(row) for row in rows]}
    finally:
        await conn.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
