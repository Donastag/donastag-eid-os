import os
import json
import logging
from typing import Any
import asyncpg
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(title="Security Engine", version="0.1.0")

PG_DSN = os.getenv(
    "PG_DSN",
    f"postgresql://{os.getenv('POSTGRES_USER', 'donastag')}:{os.getenv('POSTGRES_PASSWORD', 'postgres')}@{os.getenv('POSTGRES_HOST', 'postgres')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'donastag')}",
)


class SecurityScanRequest(BaseModel):
    request_id: str
    findings: list[dict[str, Any]] | None = None


@app.post("/scan")
async def scan(request: SecurityScanRequest):
    conn = await asyncpg.connect(PG_DSN)
    try:
        row = await conn.fetchrow("SELECT id, prompt, response FROM requests WHERE id = $1", request.request_id)
        if not row:
            raise HTTPException(status_code=404, detail="Request not found")
        findings = request.findings or []
        score = max(0, 100 - len(findings) * 10)
        scan = await conn.fetchrow(
            "INSERT INTO security_scans (request_id, findings, score) VALUES ($1, $2, $3) RETURNING id, request_id, status, findings, score, created_at, updated_at",
            request.request_id,
            json.dumps(findings),
            score,
        )
        scan = dict(scan)
        scan["findings"] = json.loads(scan["findings"]) if scan["findings"] else []
        if findings:
            await conn.executemany(
                "INSERT INTO security_findings (scan_id, severity, title, detail, metadata) VALUES ($1, $2, $3, $4, $5)",
                [(scan["id"], item.get("severity", "low"), item.get("title", ""), item.get("detail", ""), json.dumps(item.get("metadata", {})) ) for item in findings],
            )
        return scan
    finally:
        await conn.close()


@app.get("/scans")
async def list_scans(limit: int = 50):
    conn = await asyncpg.connect(PG_DSN)
    try:
        rows = await conn.fetch("SELECT id, request_id, status, findings, score, created_at, updated_at FROM security_scans ORDER BY created_at DESC LIMIT $1", limit)
        return {"scans": [dict(row) for row in rows]}
    finally:
        await conn.close()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "security_engine"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
