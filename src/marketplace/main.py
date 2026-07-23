import os
import json
import logging
from typing import Any
import asyncpg
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(title="Marketplace", version="0.1.0")

PG_DSN = os.getenv(
    "PG_DSN",
    f"postgresql://{os.getenv('POSTGRES_USER', 'donastag')}:{os.getenv('POSTGRES_PASSWORD', 'postgres')}@{os.getenv('POSTGRES_HOST', 'postgres')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'donastag')}",
)


class Listing(BaseModel):
    title: str
    description: str
    price: float
    currency: str = "USD"
    seller_id: str | None = None
    status: str = "active"
    metadata: dict[str, Any] | None = None


class Order(BaseModel):
    listing_id: str
    buyer_id: str | None = None
    amount: float
    currency: str = "USD"
    status: str = "pending"
    metadata: dict[str, Any] | None = None


@app.post("/listings")
async def create_listing(listing: Listing):
    conn = await asyncpg.connect(PG_DSN)
    try:
        row = await conn.fetchrow(
            "INSERT INTO marketplace_listings (title, description, price, currency, seller_id, status, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, title, description, price, currency, seller_id, status, metadata, created_at, updated_at",
            listing.title,
            listing.description,
            listing.price,
            listing.currency,
            listing.seller_id,
            listing.status,
            json.dumps(listing.metadata or {}),
        )
        return dict(row)
    finally:
        await conn.close()


@app.get("/listings")
async def list_listings(limit: int = 50):
    conn = await asyncpg.connect(PG_DSN)
    try:
        rows = await conn.fetch("SELECT id, title, description, price, currency, seller_id, status, metadata, created_at, updated_at FROM marketplace_listings ORDER BY created_at DESC LIMIT $1", limit)
        return {"listings": [dict(row) for row in rows]}
    finally:
        await conn.close()


@app.post("/orders")
async def create_order(order: Order):
    conn = await asyncpg.connect(PG_DSN)
    try:
        row = await conn.fetchrow(
            "INSERT INTO marketplace_orders (listing_id, buyer_id, amount, currency, status, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, listing_id, buyer_id, amount, currency, status, metadata, created_at, updated_at",
            order.listing_id,
            order.buyer_id,
            order.amount,
            order.currency,
            order.status,
            json.dumps(order.metadata or {}),
        )
        return dict(row)
    finally:
        await conn.close()


@app.get("/orders")
async def list_orders(limit: int = 50):
    conn = await asyncpg.connect(PG_DSN)
    try:
        rows = await conn.fetch("SELECT id, listing_id, buyer_id, amount, currency, status, metadata, created_at, updated_at FROM marketplace_orders ORDER BY created_at DESC LIMIT $1", limit)
        return {"orders": [dict(row) for row in rows]}
    finally:
        await conn.close()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "marketplace"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
