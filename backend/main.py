from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.connection import init_db
from api.routes import router as api_router

app = FastAPI(
    title="DevOps Log Intelligence API",
    description="Multi-agent AI platform for automated incident diagnostics and SRE report synthesis.",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import asyncio
import logging
import requests

logger = logging.getLogger(__name__)

@app.on_event("startup")
def on_startup():
    init_db()
    
    # Render keep-alive anti-sleep background task
    render_url = os.getenv("RENDER_EXTERNAL_URL") or os.getenv("BACKEND_URL")
    if render_url:
        async def keep_alive_loop():
            while True:
                await asyncio.sleep(300)  # Ping every 5 minutes (300s)
                try:
                    target = f"{render_url.rstrip('/')}/api/health"
                    requests.get(target, timeout=5)
                    logger.info(f"Render anti-sleep keep-alive ping sent to {target}")
                except Exception as e:
                    logger.warning(f"Keep-alive ping error: {e}")

        loop = asyncio.get_event_loop()
        loop.create_task(keep_alive_loop())

app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
