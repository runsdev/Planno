import pytest
import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ai_engine.nlp.task_parser import TaskParser
from ai_engine.nlp.daily_briefing import DailyBriefingGenerator
from ai_engine.nlp.onboarding_parser import OnboardingParser
from ai_engine.prioritization.priority_scorer import PriorityScorer
from ai_engine.detection.procrastination import ProcrastinationDetector
from ai_engine.scheduling.time_blocker import TimeBlocker
from ai_engine.energy.energy_learner import EnergyLearner


def test_full_pipeline_task_input_to_schedule():
    parser  = TaskParser()
    scorer  = PriorityScorer()
    blocker = TimeBlocker()

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

    jadwal = blocker.generate_schedule([{
        "task_id": "task_001",
        "title": parsed["title"],
        "duration_minutes": parsed["duration_minutes"],
        "priority_score": scored["priority_score"],
        "category": parsed["category"]
    }])
    assert len(jadwal["blocks"]) > 0
    assert jadwal["total_tasks"] == 1


def test_full_pipeline_onboarding_to_schedule():
    onboarding_parser = OnboardingParser()
    learner = EnergyLearner()
    blocker = TimeBlocker()

    preferences = {
        "focusTime": "7-10 pagi",
        "workStyle": "Deep focus",
        "workHours": {"start": "08:00", "end": "17:00"},
        "focusDuration": "90",
        "taskType": "early"
    }

    config = onboarding_parser.parse(preferences)
    assert "energy_pattern" in config
    assert config["focus_duration_minutes"] == 90
    assert config["break_interval_minutes"] == 90
    assert config["work_start"] == "08:00"

    result = learner.set_onboarding_pattern("user_onboard", config["energy_pattern"])
    assert result["success"] == True

    peak = learner.get_peak_hours("user_onboard")
    assert "peak_hours" in peak
    assert peak["source"] == "onboarding"

    jadwal = blocker.generate_schedule(
        tasks=[{
            "task_id": "task_001",
            "title": "Laporan Capstone",
            "duration_minutes": None,
            "priority_score": 90,
            "category": "Akademik"
        }],
        work_start=config["work_start"],
        work_end=config["work_end"],
        focus_duration_minutes=config["focus_duration_minutes"],
        break_interval_minutes=config["break_interval_minutes"]
    )
    assert len(jadwal["blocks"]) > 0
    assert jadwal["focus_duration_used"] == 90


def test_full_pipeline_energy_to_schedule():
    learner = EnergyLearner()
    blocker = TimeBlocker()
    scorer  = PriorityScorer()

    peak = learner.get_peak_hours("user_test")
    assert "peak_hours" in peak
    assert len(peak["peak_hours"]) > 0

    slot = learner.get_energy_for_slot("user_test", "09:00")
    assert slot["label"] in ["tinggi", "sedang", "rendah"]

    besok = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
    scored = scorer.score_task({
        "deadline": besok,
        "importance": "high",
        "duration_minutes": 90,
        "reschedule_count": 0
    })

    jadwal = blocker.generate_schedule([{
        "task_id": "task_001",
        "title": "Task Berat",
        "duration_minutes": 90,
        "priority_score": scored["priority_score"],
        "category": "work"
    }])
    assert len(jadwal["blocks"]) > 0


def test_full_pipeline_procrastination_to_briefing():
    detector  = ProcrastinationDetector()
    generator = DailyBriefingGenerator()

    kemarin = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    task_terlambat = {
        "title": "Laporan Terlambat",
        "deadline": kemarin,
        "reschedule_count": 0,
        "last_updated": datetime.now().strftime("%Y-%m-%d")
    }

    deteksi = detector.detect(task_terlambat)
    assert deteksi["is_procrastinating"] == True

    briefing = generator.generate(
        user_name="Desi",
        top_tasks=[{
            "title": "Laporan Q1",
            "deadline": datetime.now().strftime("%Y-%m-%d"),
            "priority_score": 95,
            "category": "work"
        }],
        peak_hours=["09:00", "10:00", "11:00"],
        procrastination_flags=[task_terlambat]
    )
    assert briefing["success"] == True
    assert briefing["briefing_text"] is not None


def test_full_pipeline_onboarding_procrastination_threshold():
    parser = OnboardingParser()

    config_lastminute = parser.parse({
        "focusTime": "18-22 malam",
        "workStyle": "Multitasking",
        "workHours": {"start": "10:00", "end": "22:00"},
        "focusDuration": "30",
        "taskType": "last-minute"
    })

    config_early = parser.parse({
        "focusTime": "7-10 pagi",
        "workStyle": "Deep focus",
        "workHours": {"start": "07:00", "end": "16:00"},
        "focusDuration": "120",
        "taskType": "early"
    })

    assert config_lastminute["procrastination_threshold"] > config_early["procrastination_threshold"]
    assert config_lastminute["focus_duration_minutes"] == 30
    assert config_early["focus_duration_minutes"] == 120
