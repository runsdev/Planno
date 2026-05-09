from fastapi import APIRouter
from app.schemas import (
    BriefingGenerateRequest,
    BriefingGenerateResponse,
    BriefingSimpleRequest,
    BriefingSimpleResponse,
)
from ai_engine.nlp.daily_briefing import DailyBriefingGenerator

router = APIRouter(prefix="/api/briefing", tags=["briefing"])

_generator = DailyBriefingGenerator()


@router.post("/generate", response_model=BriefingGenerateResponse)
async def generate_briefing(body: BriefingGenerateRequest):
    """
    Generate a personalised daily briefing using task data and energy patterns.
    """
    result = _generator.generate(
        user_name=body.user_name,
        top_tasks=[t.model_dump() for t in body.top_tasks],
        peak_hours=body.peak_hours,
        procrastination_flags=(
            [t.model_dump() for t in body.procrastination_flags]
            if body.procrastination_flags
            else None
        ),
        completion_rate=body.completion_rate,
    )
    return result


@router.post("/simple", response_model=BriefingSimpleResponse)
async def generate_simple_briefing(body: BriefingSimpleRequest):
    """
    Generate a quick briefing without energy or completion data.
    """
    text = _generator.generate_simple(
        user_name=body.user_name,
        top_tasks=[t.model_dump() for t in body.top_tasks],
    )
    return {"briefing_text": text}
