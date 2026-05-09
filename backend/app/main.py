import sys
import os

# Make the project root importable so ai_engine can be resolved
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import tasks, onboarding, briefing

app = FastAPI(
    title="Planno API",
    description="AI-powered planning backend for Planno",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://api.planno.runsha.dev"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router)
app.include_router(onboarding.router)
app.include_router(briefing.router)


@app.get("/")
async def root():
    return {"message": "Planno API is running"}


@app.get("/health")
async def health():
    return {"status": "ok"}
