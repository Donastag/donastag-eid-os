import os
import json
import logging
from typing import Any
import asyncpg
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(title="Engineering Inbox", version="0.1.0")

PG_DSN = os.getenv(
    "PG_DSN",
    f"postgresql://{os.getenv('POSTGRES_USER', 'donastag')}:{os.getenv('POSTGRES_PASSWORD', 'postgres')}@{os.getenv('POSTGRES_HOST', 'postgres')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'donastag')}",
)


class InboxItem(BaseModel):
    source: str
    subject: str
    body: str
    status: str = "open"
    metadata: dict[str, Any] | None = None


@app.post("/items")
async def create_item(item: InboxItem):
    conn = await asyncpg.connect(PG_DSN)
    try:
        row = await conn.fetchrow(
            "INSERT INTO inbox (source, subject, body, status, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING id, source, subject, body, status, metadata, created_at, updated_at",
            item.source,
            item.subject,
            item.body,
            item.status,
            json.dumps(item.metadata or {}),
        )
        return dict(row)
    finally:
        await conn.close()


@app.get("/items")
async def list_items(limit: int = 50):
    conn = await asyncpg.connect(PG_DSN)
    try:
        rows = await conn.fetch("SELECT id, source, subject, body, status, metadata, created_at, updated_at FROM inbox ORDER BY created_at DESC LIMIT $1", limit)
        return {"items": [dict(row) for row in rows]}
    finally:
        await conn.close()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "inbox"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
