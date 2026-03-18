import pytest
import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ai_engine.nlp.task_parser import TaskParser
from ai_engine.nlp.daily_briefing import DailyBriefingGenerator
from ai_engine.prioritization.priority_scorer import PriorityScorer
from ai_engine.detection.procrastination import ProcrastinationDetector
from ai_engine.scheduling.time_blocker import TimeBlocker
from ai_engine.energy.energy_learner import EnergyLearner
from ai_engine.energy.habit_correlation import HabitCorrelationAnalyzer
from ai_engine.prediction.duration_predictor import DurationPredictor
from ai_engine.weekly_analytics import WeeklyAnalytics


def test_full_pipeline_task_input_to_schedule():
    """
    Test alur penuh: user input task → parse → prioritize → schedule
    """
    parser = TaskParser()
    scorer = PriorityScorer()
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


def test_full_pipeline_energy_to_schedule():
    """
    Test alur: energy log → peak hours → energy-aware scheduling
    """
    learner = EnergyLearner()
    blocker = TimeBlocker()
    scorer = PriorityScorer()

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
    """
    Test alur: deteksi prokrastinasi → masuk daily briefing
    """
    detector = ProcrastinationDetector()
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


def test_full_pipeline_habit_to_analytics():
    """
    Test alur: catat habit + task → analytics + insight
    """
    analyzer = HabitCorrelationAnalyzer()
    analytics = WeeklyAnalytics()
    today = datetime.now()
    week_start = today - timedelta(days=today.weekday())

    for i in range(8):
        tidur = 8 if i % 2 == 0 else 5
        completion = 0.9 if i % 2 == 0 else 0.4
        tanggal = (week_start + timedelta(days=i % 7)).strftime("%Y-%m-%d")

        analyzer.record_day(
            user_id="user_integration",
            tanggal=tanggal,
            habits={"tidur_jam": tidur, "olahraga": i % 3 == 0},
            completion_rate=completion
        )

        analytics.record_task("user_integration", {
            "task_id": f"task_{i}",
            "title": f"Task {i}",
            "category": "work",
            "status": "done" if i % 2 == 0 else "pending",
            "estimasi_menit": 60,
            "aktual_menit": 75,
            "tanggal": tanggal
        })

    insights = analyzer.get_insights("user_integration")
    assert insights["success"] == True
    assert insights["data_points"] >= 7

    metrics = analytics.get_weekly_metrics("user_integration")
    assert metrics["total_tasks"] > 0
    assert metrics["completion_rate"] is not None


def test_full_pipeline_duration_prediction():
    """
    Test alur: catat histori → prediksi durasi lebih akurat
    """
    predictor = DurationPredictor()

    for _ in range(6):
        predictor.record_actual("user_test", "academic", 60, 90)

    prediksi = predictor.predict("user_test", "academic", 60)
    assert prediksi["confidence"] in ["medium", "high"]
    assert prediksi["prediksi_aktual"] > 60

    report = predictor.get_accuracy_report("user_test")
    assert report["total_tasks"] == 6
    assert report["rata_rata_rasio"] == 1.5
