"""GenBots Enterprise Platform - FastAPI Application Entry Point."""
from contextlib import asynccontextmanager
import os

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


root_path = "/api/backend" if os.getenv("VERCEL") else ""

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="GenBots Enterprise Platform - IoT, Robotics & AI Solutions",
    # Vercel strips /api/backend → FastAPI sees /api/v1/...
    # docs_url must sit under /api/v1/ so /api/backend/api/v1/docs resolves.
    docs_url="/api/v1/docs" if settings.DEBUG else None,
    redoc_url="/api/v1/redoc" if settings.DEBUG else None,
    openapi_url="/api/v1/openapi.json",
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

# On Vercel the working directory is read-only; use /tmp which is always writable.
UPLOAD_DIR = "/tmp/uploads" if os.getenv("VERCEL") else "uploads"
try:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
except Exception as _mount_err:
    logger.warning(f"Could not mount /uploads static directory: {_mount_err}")

# ── Health endpoints under /api/v1 ─────────────────────────────────────────
# Vercel rewrites /api/backend(.*) → backend service, stripping /api/backend.
# So GET /api/backend/api/v1/health arrives at FastAPI as GET /api/v1/health.
# These routes MUST be under api_router (prefix=/api/v1) to match.
@api_router.get("/health", tags=["Health"])
@api_router.get("/healthz", tags=["Health"])
async def health_check():
    """Health check endpoint - confirms app is running."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


@api_router.get("/readyz", tags=["Health"])
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


# Include API routes (AFTER health routes are added to api_router)
app.include_router(api_router)


# Register root-level health/readyz fallbacks for local integration tests and monitoring
@app.get("/health", tags=["Health"])
@app.get("/healthz", tags=["Health"])
async def root_health_check():
    return await health_check()


@app.get("/readyz", tags=["Health"])
async def root_readiness_check():
    return await readiness_check()

