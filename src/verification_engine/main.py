import os
import json
import logging
from typing import Any
import asyncpg
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(title="Verification Engine", version="0.1.0")

PG_DSN = os.getenv(
    "PG_DSN",
    f"postgresql://{os.getenv('POSTGRES_USER', 'donastag')}:{os.getenv('POSTGRES_PASSWORD', 'postgres')}@{os.getenv('POSTGRES_HOST', 'postgres')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'donastag')}",
)


class VerificationRequest(BaseModel):
    request_id: str
    checks: list[dict[str, Any]] | None = None


def build_default_checks(result: dict[str, Any]) -> list[dict[str, Any]]:
    return [
        {"name": "has_response", "passed": bool(result.get("response"))},
        {"name": "allowed_set", "passed": isinstance(result.get("allowed"), bool)},
        {"name": "reason_present", "passed": "reason" in result},
    ]


@app.post("/verify")
async def verify(request: VerificationRequest):
    conn = await asyncpg.connect(PG_DSN)
    try:
        row = await conn.fetchrow("SELECT id, prompt, capability, action, allowed, reason, response, metadata FROM requests WHERE id = $1", request.request_id)
        if not row:
            raise HTTPException(status_code=404, detail="Request not found")
        result = {
            "prompt": row["prompt"],
            "capability": row["capability"],
            "action": row["action"],
            "allowed": row["allowed"],
            "reason": row["reason"],
            "response": row["response"],
            "metadata": json.loads(row["metadata"]) if row["metadata"] else {},
        }
        checks = request.checks or build_default_checks(result)
        passed = all(item.get("passed") for item in checks)
        verification = await conn.fetchrow(
            "INSERT INTO verifications (request_id, status, checks, result) VALUES ($1, $2, $3, $4) RETURNING id, request_id, status, checks, result, created_at, updated_at",
            request.request_id,
            "passed" if passed else "failed",
            json.dumps(checks),
            json.dumps(result),
        )
        verification = dict(verification)
        verification["checks"] = json.loads(verification["checks"]) if verification["checks"] else []
        verification["result"] = json.loads(verification["result"]) if verification["result"] else {}
        await conn.execute(
            "INSERT INTO verification_runs (verification_id, passed, message, metadata) VALUES ($1, $2, $3, $4)",
            verification["id"],
            passed,
            "all checks passed" if passed else "one or more checks failed",
            json.dumps({"request_id": request.request_id}),
        )
        return {
            "verification": verification,
            "passed": passed,
        }
    finally:
        await conn.close()


@app.get("/verifications")
async def list_verifications(limit: int = 50):
    conn = await asyncpg.connect(PG_DSN)
    try:
        rows = await conn.fetch("SELECT id, request_id, status, checks, result, created_at, updated_at FROM verifications ORDER BY created_at DESC LIMIT $1", limit)
        return {"verifications": [dict(row) for row in rows]}
    finally:
        await conn.close()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "verification_engine"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
