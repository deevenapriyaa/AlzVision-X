from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import CORS_ORIGINS, UPLOAD_DIR, REPORT_DIR
from app.database import init_db, SessionLocal
from app.api.routes import router
from app.utils.sample_data import seed_sample_database

app = FastAPI(
    title="AlzVision-X Backend API",
    description="Hybrid Deep Learning (MobileNet + ViT) & Agentic AI Framework for Alzheimer's Detection",
    version="1.0.0"
)

# Enable CORS for local dev and preview
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Directories for images & PDFs
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.mount("/reports", StaticFiles(directory=str(REPORT_DIR)), name="reports")

# Include Core API Router
app.include_router(router)

@app.on_event("startup")
def startup_event():
    """Initializes SQLite database tables and seeds demo cohort if empty."""
    init_db()
    db = SessionLocal()
    try:
        seed_sample_database(db)
    finally:
        db.close()

@app.get("/")
def health_check():
    return {
        "framework": "AlzVision-X",
        "status": "HEALTHY",
        "version": "1.0.0",
        "docs_url": "/docs"
    }
