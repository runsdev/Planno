import pytest
import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ai_engine.nlp.task_parser import TaskParser
from ai_engine.nlp.daily_briefing import DailyBriefingGenerator
from ai_engine.nlp.onboarding_parser import OnboardingParser
from ai_engine.prioritization.priority_scorer import PriorityScorer


def test_full_pipeline_task_input_to_priority():
    """
    Test alur penuh: user input task → parse → prioritize
    """
    parser = TaskParser()
    scorer = PriorityScorer()

    parsed = parser.parse("kerjakan laporan riset besok jam 2 siang selama 2 jam")
    assert parsed["success"] == True
    assert parsed["title"] is not None

    besok = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
    scored = scorer.score_task({
        "deadline": besok,
        "importance": "high",
        "duration_minutes": parsed["duration_minutes"],
        "reschedule_count": 0
    })
    assert scored["priority_score"] > 0
    assert scored["quadrant"] in ["DO_FIRST", "SCHEDULE", "DELEGATE", "ELIMINATE"]


def test_full_pipeline_onboarding_to_config():
    """
    Test alur: onboarding → konfigurasi AI personal
    """
    parser = OnboardingParser()

    preferences = {
        "focusTime": "7-10 pagi",
        "workStyle": "Deep focus",
        "workHours": {"start": "08:00", "end": "17:00"},
        "focusDuration": "60",
        "taskType": "early"
    }

    config = parser.parse(preferences)
    assert "energy_pattern" in config
    assert config["focus_duration_minutes"] == 60
    assert config["work_start"] == "08:00"
    assert config["work_end"] == "17:00"
    assert config["briefing_tone"] == "fokus dan tegas"

    peak = parser.get_peak_hours_from_config(config)
    assert len(peak) == 3
    assert all(":" in h for h in peak)


def test_full_pipeline_onboarding_to_briefing():
    """
    Test alur: onboarding → peak hours → daily briefing personal
    """
    onboarding = OnboardingParser()
    generator  = DailyBriefingGenerator()
    scorer     = PriorityScorer()

    config = onboarding.parse({
        "focusTime": "7-10 pagi",
        "workStyle": "Deep focus",
        "workHours": {"start": "08:00", "end": "17:00"},
        "focusDuration": "60",
        "taskType": "early"
    })

    peak_hours = onboarding.get_peak_hours_from_config(config)

    besok = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
    scored = scorer.score_task({
        "deadline": besok,
        "importance": "high",
        "duration_minutes": 120,
        "reschedule_count": 0
    })

    briefing = generator.generate(
        user_name="Desi",
        top_tasks=[{
            "title": "Laporan Capstone",
            "deadline": besok,
            "priority_score": scored["priority_score"],
            "category": "Akademik"
        }],
        peak_hours=peak_hours,
        procrastination_flags=[]
    )
    assert briefing["success"] == True
    assert briefing["briefing_text"] is not None


def test_full_pipeline_priority_top3():
    """
    Test alur: beberapa task → prioritize → ambil top 3 untuk sidebar
    """
    scorer = PriorityScorer()

    tasks_raw = [
        {"deadline": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d %H:%M"),
         "importance": "high", "duration_minutes": 60, "reschedule_count": 0},
        {"deadline": (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d %H:%M"),
         "importance": "medium", "duration_minutes": 30, "reschedule_count": 0},
        {"deadline": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d %H:%M"),
         "importance": "low", "duration_minutes": 45, "reschedule_count": 0},
        {"deadline": (datetime.now() + timedelta(hours=2)).strftime("%Y-%m-%d %H:%M"),
         "importance": "high", "duration_minutes": 90, "reschedule_count": 2},
    ]

    scored_tasks = [scorer.score_task(t) for t in tasks_raw]
    sorted_tasks = sorted(scored_tasks, key=lambda x: x["priority_score"], reverse=True)
    top3 = sorted_tasks[:3]

    assert len(top3) == 3
    assert top3[0]["priority_score"] >= top3[1]["priority_score"]
    assert top3[1]["priority_score"] >= top3[2]["priority_score"]


def test_full_pipeline_onboarding_different_profiles():
    """
    Test bahwa profil onboarding berbeda menghasilkan konfigurasi berbeda
    """
    parser = OnboardingParser()

    config_pagi = parser.parse({
        "focusTime": "7-10 pagi",
        "workStyle": "Deep focus",
        "workHours": {"start": "07:00", "end": "15:00"},
        "focusDuration": "120",
        "taskType": "early"
    })

    config_malam = parser.parse({
        "focusTime": "18-22 malam",
        "workStyle": "Multitasking",
        "workHours": {"start": "14:00", "end": "22:00"},
        "focusDuration": "30",
        "taskType": "last-minute"
    })

    # Konfigurasi harus berbeda sesuai profil
    assert config_pagi["focus_duration_minutes"] != config_malam["focus_duration_minutes"]
    assert config_pagi["work_start"] != config_malam["work_start"]
    assert config_pagi["briefing_tone"] != config_malam["briefing_tone"]
    assert config_pagi["procrastination_threshold"] != config_malam["procrastination_threshold"]

    # Peak hours harus berbeda
    peak_pagi  = parser.get_peak_hours_from_config(config_pagi)
    peak_malam = parser.get_peak_hours_from_config(config_malam)
    assert peak_pagi != peak_malam
