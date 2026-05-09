from fastapi import APIRouter, HTTPException
from app.schemas import (
    TaskParseRequest,
    TaskParseResponse,
    TaskScoreRequest,
    TaskScoreResponse,
)
from ai_engine.nlp.task_parser import TaskParser
from ai_engine.prioritization.priority_scorer import PriorityScorer

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

_parser = TaskParser()
_scorer = PriorityScorer()


@router.post("/parse", response_model=TaskParseResponse)
async def parse_task(body: TaskParseRequest):
    """
    Parse a natural-language task description into structured task data.
    """
    result = _parser.parse(body.raw_input)
    return result


@router.post("/score", response_model=TaskScoreResponse)
async def score_task(body: TaskScoreRequest):
    """
    Calculate the priority score and Eisenhower quadrant for a task.
    """
    result = _scorer.score_task(body.model_dump())
    return result
