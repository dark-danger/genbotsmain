"""GenBots Enterprise Platform - FastAPI Application Entry Point."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from sqlalchemy import text

from app.core.config import settings
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    yield
    logger.info("Shutting down application")


import os

root_path = "/api/backend" if os.getenv("VERCEL") else ""

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="GenBots Enterprise Platform - IoT, Robotics & AI Solutions",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
    root_path=root_path,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles

# Create uploads directory if not exists
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include API routes
app.include_router(api_router)


@app.get("/health", tags=["Health"])
@app.get("/healthz", tags=["Health"])
async def health_check():
    """Health check endpoint - confirms app is running."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/readyz", tags=["Health"])
async def readiness_check():
    """Readiness check - confirms app can connect to database."""
    from app.core.database import engine
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "database": db_status},
        )
    return {"status": "ready", "database": db_status}
