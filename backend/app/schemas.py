from pydantic import BaseModel, Field
from typing import Optional


# ── Task Parser ──────────────────────────────────────────────────────────────

class TaskParseRequest(BaseModel):
    raw_input: str = Field(..., min_length=1, description="Natural-language task input")


class TaskParseResponse(BaseModel):
    success: bool
    raw_input: Optional[str] = None
    title: Optional[str] = None
    deadline: Optional[str] = None
    duration_minutes: Optional[int] = None
    category: Optional[str] = None
    error: Optional[str] = None


# ── Priority Scorer ───────────────────────────────────────────────────────────

class TaskScoreRequest(BaseModel):
    deadline: Optional[str] = Field(None, description="YYYY-MM-DD or YYYY-MM-DD HH:MM")
    importance: str = Field("medium", pattern="^(high|medium|low)$")
    duration_minutes: Optional[int] = None
    reschedule_count: int = Field(0, ge=0)


class TaskScoreResponse(BaseModel):
    priority_score: int
    quadrant: str
    urgency: str
    importance: str


# ── Onboarding Parser ─────────────────────────────────────────────────────────

class WorkHours(BaseModel):
    start: str = Field("08:00", description="HH:MM")
    end: str = Field("17:00", description="HH:MM")


class OnboardingParseRequest(BaseModel):
    focusTime: str = Field(
        "7-10 pagi",
        description="7-10 pagi | 10-14 siang | 14-18 siang | 18-22 malam",
    )
    workStyle: str = Field(
        "Deep focus",
        description="Deep focus | Multitasking | Bergantian",
    )
    workHours: WorkHours = Field(default_factory=WorkHours)
    focusDuration: str = Field("60", description="30 | 60 | 120")
    taskType: str = Field("early", description="last-minute | early")


class OnboardingParseResponse(BaseModel):
    energy_pattern: dict
    work_start: str
    work_end: str
    focus_duration_minutes: int
    break_interval_minutes: int
    procrastination_threshold: int
    work_style: str
    task_type: str
    briefing_tone: str


# ── Daily Briefing ────────────────────────────────────────────────────────────

class BriefingTask(BaseModel):
    title: str
    deadline: Optional[str] = None
    priority_score: Optional[int] = None
    category: Optional[str] = None


class BriefingGenerateRequest(BaseModel):
    user_name: str = Field(..., min_length=1)
    top_tasks: list[BriefingTask]
    peak_hours: list[str]
    procrastination_flags: Optional[list[BriefingTask]] = None
    completion_rate: Optional[float] = Field(None, ge=0.0, le=1.0)


class BriefingGenerateResponse(BaseModel):
    success: bool
    briefing_text: Optional[str] = None
    top_tasks: Optional[list] = None
    peak_hours: Optional[list] = None
    generated_at: Optional[str] = None
    error: Optional[str] = None


class BriefingSimpleRequest(BaseModel):
    user_name: str = Field(..., min_length=1)
    top_tasks: list[BriefingTask]


class BriefingSimpleResponse(BaseModel):
    briefing_text: str
