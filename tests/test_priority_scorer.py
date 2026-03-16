import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ai_engine.prioritization.priority_scorer import PriorityScorer

scorer = PriorityScorer()


def test_deadline_besok_importance_high():
    """Deadline besok + importance high → DO_FIRST"""
    from datetime import datetime, timedelta
    besok = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
    hasil = scorer.score_task({
        "deadline": besok,
        "importance": "high",
        "duration_minutes": 120,
        "reschedule_count": 0
    })
    assert hasil["quadrant"] == "DO_FIRST"
    assert hasil["priority_score"] >= 70
    assert hasil["urgency"] == "high"


def test_deadline_jauh_importance_high():
    """Deadline 3 minggu lagi + importance high → SCHEDULE"""
    from datetime import datetime, timedelta
    jauh = (datetime.now() + timedelta(days=21)).strftime("%Y-%m-%d %H:%M")
    hasil = scorer.score_task({
        "deadline": jauh,
        "importance": "high",
        "duration_minutes": 60,
        "reschedule_count": 0
    })
    assert hasil["quadrant"] == "SCHEDULE"
    assert hasil["urgency"] == "low"


def test_deadline_besok_importance_low():
    """Deadline besok + importance low → DELEGATE"""
    from datetime import datetime, timedelta
    besok = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
    hasil = scorer.score_task({
        "deadline": besok,
        "importance": "low",
        "duration_minutes": 30,
        "reschedule_count": 0
    })
    assert hasil["quadrant"] == "DELEGATE"


def test_deadline_jauh_importance_low():
    """Deadline jauh + importance low → ELIMINATE"""
    from datetime import datetime, timedelta
    jauh = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d %H:%M")
    hasil = scorer.score_task({
        "deadline": jauh,
        "importance": "low",
        "duration_minutes": 15,
        "reschedule_count": 0
    })
    assert hasil["quadrant"] == "ELIMINATE"
    assert hasil["priority_score"] <= 40


def test_deadline_terlewat():
    """Deadline sudah lewat → urgency high"""
    from datetime import datetime, timedelta
    kemarin = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
    hasil = scorer.score_task({
        "deadline": kemarin,
        "importance": "medium",
        "duration_minutes": 60,
        "reschedule_count": 0
    })
    assert hasil["urgency"] == "high"
    assert hasil["priority_score"] >= 70


def test_reschedule_tingkatkan_urgency():
    """Task yang sering ditunda harus urgency lebih tinggi"""
    from datetime import datetime, timedelta
    minggu_depan = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d %H:%M")

    tanpa_reschedule = scorer.score_task({
        "deadline": minggu_depan,
        "importance": "medium",
        "duration_minutes": 60,
        "reschedule_count": 0
    })

    dengan_reschedule = scorer.score_task({
        "deadline": minggu_depan,
        "importance": "medium",
        "duration_minutes": 60,
        "reschedule_count": 3
    })

    assert dengan_reschedule["priority_score"] > tanpa_reschedule["priority_score"]


def test_tanpa_deadline():
    """Task tanpa deadline harus tetap bisa di-score"""
    hasil = scorer.score_task({
        "deadline": None,
        "importance": "medium",
        "duration_minutes": 30,
        "reschedule_count": 0
    })
    assert hasil["priority_score"] is not None
    assert hasil["quadrant"] in ["DO_FIRST", "SCHEDULE", "DELEGATE", "ELIMINATE"]


def test_return_fields_lengkap():
    """Response harus selalu punya semua field"""
    hasil = scorer.score_task({
        "deadline": None,
        "importance": "high",
        "duration_minutes": 60,
        "reschedule_count": 0
    })
    assert "priority_score" in hasil
    assert "quadrant" in hasil
    assert "urgency" in hasil
    assert "importance" in hasil
