#!/usr/bin/env python3
"""
AI Router Service for Donastag Engineering OS
Queries the capabilities table and routes requests to AI providers
"""
import os
import json
import logging
from typing import Dict, Any, Optional
import asyncio
import asyncpg
import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="AI Router", version="0.1.0")

# Database configuration
DB_CONFIG = {
    "host": os.getenv("POSTGRES_HOST", "postgres"),
    "port": int(os.getenv("POSTGRES_PORT", "5432")),
    "database": os.getenv("POSTGRES_DB", "donastag"),
    "user": os.getenv("POSTGRES_USER", "donastag"),
    "password": os.getenv("POSTGRES_PASSWORD", ""),
}

# Request model for chat completion
class ChatCompletionRequest(BaseModel):
    model: str
    messages: list
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = None
    stream: Optional[bool] = False

async def get_db_connection():
    """Get a database connection pool"""
    return await asyncpg.create_pool(**DB_CONFIG)

async def get_active_ai_providers():
    """Fetch active AI providers from the capabilities table"""
    pool = await get_db_connection()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT name, invocation_method, endpoint, secret_ref, cost_model, metadata
            FROM capabilities 
            WHERE type = 'ai_provider' AND status = 'active'
            ORDER BY name
        """)
    await pool.close()
    
    providers = []
    for row in rows:
        providers.append({
            "name": row["name"],
            "invocation_method": row["invocation_method"],
            "endpoint": row["endpoint"],
            "secret_ref": row["secret_ref"],
            "cost_model": json.loads(row["cost_model"]) if row["cost_model"] else {},
            "metadata": json.loads(row["metadata"]) if row["metadata"] else {}
        })
    return providers


def select_provider(providers):
    default = os.getenv("DEFAULT_PROVIDER")
    if default:
        for provider in providers:
            if provider["name"] == default:
                return provider
    return providers[0] if providers else None

@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    logger.info("AI Router starting up...")
    try:
        providers = await get_active_ai_providers()
        logger.info(f"Found {len(providers)} active AI providers: {[p['name'] for p in providers]}")
    except Exception as e:
        logger.error(f"Failed to connect to database on startup: {e}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        providers = await get_active_ai_providers()
        return {
            "status": "healthy", 
            "service": "ai-router",
            "providers": [p["name"] for p in providers]
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database connection failed: {str(e)}")

@app.get("/providers")
async def list_providers():
    """List all available AI providers"""
    try:
        providers = await get_active_ai_providers()
        return {"providers": providers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/route")
async def route_info():
    """Return the selected provider for the current registration state."""
    providers = await get_active_ai_providers()
    selected = select_provider(providers)
    return {
        "selected": selected,
        "available": providers,
    }

@app.post("/v1/chat/completions")
@app.post("/chat/completions")
async def chat_completions(request: Request):
    """
    Proxy endpoint for chat completions.
    Forwards the request to the first available AI provider.
    """
    try:
        # Get the request body
        body = await request.json()
        
        # Get active providers
        providers = await get_active_ai_providers()
        
        if not providers:
            raise HTTPException(status_code=503, detail="No AI providers available")
        
        # For now, just use the selected provider
        # In future versions, this could implement load balancing, failover, etc.
        selected_provider = select_provider(providers)
        if not selected_provider:
            raise HTTPException(status_code=503, detail="No AI providers available")
        logger.info(f"Routing request to provider: {selected_provider['name']}")
        
        # Prepare headers for the target API
        headers = {
            "Content-Type": "application/json",
        }
        
        if selected_provider["name"] == "claude-api":
            api_key = os.getenv("ANTHROPIC_API_KEY") or os.getenv("CLAUDE_API_KEY")
            if api_key:
                headers["x-api-key"] = api_key
                headers["anthropic-version"] = "2023-06-01"
        elif selected_provider["name"] == "openai":
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                headers["Authorization"] = f"Bearer {api_key}"
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                selected_provider["endpoint"],
                json=body,
                headers=headers
            )
            
        # Return the response from the provider
        return JSONResponse(
            content=response.json(),
            status_code=response.status_code
        )
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in request body")
    except httpx.RequestError as e:
        logger.error(f"Error forwarding request to AI provider: {e}")
        raise HTTPException(status_code=502, detail=f"Failed to connect to AI provider: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in chat_completions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def _proxy_forward(request: Request, path: str):
    """Forward supported requests to an active AI provider, with safe fallbacks."""
    try:
        body = await request.body() if request.method in ["POST", "PUT", "PATCH"] else None
        query_params = str(request.url.query) if request.url.query else ""

        providers = await get_active_ai_providers()
        if not providers:
            raise HTTPException(status_code=503, detail="No AI providers available")

        selected_provider = select_provider(providers)
        if not selected_provider:
            raise HTTPException(status_code=503, detail="No AI providers available")

        logger.info(f"Proxying {request.method} /{path} to provider: {selected_provider['name']}")

        headers = {
            "Content-Type": request.headers.get("Content-Type", "application/json"),
        }

        if selected_provider["name"] == "claude-api":
            api_key = os.getenv("ANTHROPIC_API_KEY") or os.getenv("CLAUDE_API_KEY")
            if api_key:
                headers["x-api-key"] = api_key
                headers["anthropic-version"] = "2023-06-30"
        elif selected_provider["name"] == "openai":
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                headers["Authorization"] = f"Bearer {api_key}"

        target_url = selected_provider["endpoint"].rstrip("/") + "/" + path.lstrip("/")
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.request(
                method=request.method,
                url=target_url,
                content=body,
                headers=headers,
                params=query_params or None,
            )

        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in _proxy_forward/{path}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_path(request: Request, path: str):
    return await _proxy_forward(request, path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
