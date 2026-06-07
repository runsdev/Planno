# frontend/src/components/planner/kanbanView.tsx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.schemas import (
    TaskParseRequest,
    TaskParseResponse,
    TaskScoreRequest,
    TaskScoreResponse,
)
from ai_engine.nlp.task_parser import TaskParser
from ai_engine.prioritization.priority_scorer import PriorityScorer
from ai_engine.prioritization.slot_finder import SlotFinder

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

_parser     = TaskParser()
_scorer     = PriorityScorer()
_slot_finder = SlotFinder()

# ── Schema untuk check-slot ───────────────────────────────────────────────────
class OccupiedSlot(BaseModel):
    start: str
    end: str

class CheckSlotRequest(BaseModel):
    proposed_start: str
    duration_minutes: int = 60
    occupied_slots: list[OccupiedSlot] = []

# ─────────────────────────────────────────────────────────────────────────────

@router.post("/parse", response_model=TaskParseResponse)
async def parse_task(body: TaskParseRequest):
    """Parse a natural-language task description into structured task data."""
    result = _parser.parse(body.raw_input, client_now=body.client_now)
    return result

@router.post("/score", response_model=TaskScoreResponse)
async def score_task(body: TaskScoreRequest):
    """Calculate the priority score and Eisenhower quadrant for a task."""
    data   = body.model_dump()
    result = _scorer.score_task(data)
    return result

@router.post("/check-slot")  # ← BUKAN "/api/tasks/check-slot", prefix sudah ada
async def check_slot(body: CheckSlotRequest):
    """Cek konflik waktu dan cari slot kosong terdekat."""
    result = _slot_finder.find_next_slot(
        proposed_start   = body.proposed_start,
        duration_minutes = body.duration_minutes,
        occupied_slots   = [s.model_dump() for s in body.occupied_slots],
    )
    return result