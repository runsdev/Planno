from fastapi import APIRouter
from app.schemas import OnboardingParseRequest, OnboardingParseResponse
from ai_engine.nlp.onboarding_parser import OnboardingParser

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])

_parser = OnboardingParser()


@router.post("/parse", response_model=OnboardingParseResponse)
async def parse_onboarding(body: OnboardingParseRequest):
    """
    Process onboarding preferences and return a personalised AI configuration.
    """
    preferences = body.model_dump()
    # Flatten workHours back to the dict shape OnboardingParser expects
    preferences["workHours"] = preferences["workHours"]
    result = _parser.parse(preferences)
    return result
