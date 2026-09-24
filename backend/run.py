import uvicorn
import os
import sys

if __name__ == "__main__":
    print("=" * 65)
    print(" AlzVision-X: Hybrid Deep Learning & Agentic AI Framework ")
    print(" Starting FastAPI Local Server on http://127.0.0.1:8000 ")
    print(" API Documentation available at: http://127.0.0.1:8000/docs ")
    print("=" * 65)
    
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
