from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core import settings
from app.core.limiter import setup_limiter
from app.core.database import Base, engine
from app.models import models # Ensure all models are registered
from app.api import auth_router, journal_router, insights_router, users_router, reflections_router, chat_router, backfill_router

# Create FastAPI app
app = FastAPI(
    title="Reflect API",
    description="Mental Health AI Web App API - AI สะท้อน ไม่ตัดสิน",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Rate Limiting
setup_limiter(app)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


# Health check
@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "environment": settings.environment,
    }


# Root endpoint
@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Reflect API",
        "docs": "/docs",
        "version": "1.0.0",
    }


# Include routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(journal_router, prefix="/api/v1")
app.include_router(insights_router, prefix="/api/v1")
app.include_router(reflections_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(backfill_router, prefix="/api/v1")


# Startup event
@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    print("🚀 Reflect API is starting...")
    print(f"📍 Environment: {settings.environment}")
    
    # Automatic table creation (useful for dev/prototype)
    print("📦 Initializing database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables verified/created.")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")

    print(f"🤖 Gemini Model Configured: {settings.gemini_model}")
    import os
    print(f"🌍 Env Var GEMINI_MODEL: {os.getenv('GEMINI_MODEL')}")
    print(f"📚 API Documentation: {settings.frontend_url}/docs")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown."""
    print("👋 Reflect API is shutting down...")
