import pytest
import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.ai_engine.prioritization.priority_scorer import PriorityScorer

scorer = PriorityScorer()

def tgl(days): return (datetime.now() + timedelta(days=days)).strftime("%Y-%m-%d %H:%M")


def test_akademik_lebih_tinggi_dari_kerja():
    s_akademik = scorer.score_task({"deadline": tgl(3), "importance": "high", "reschedule_count": 0, "category": "Akademik", "type": "Tugas"})
    s_kerja    = scorer.score_task({"deadline": tgl(3), "importance": "high", "reschedule_count": 0, "category": "Kerja",    "type": "Tugas"})
    assert s_akademik["priority_score"] >= s_kerja["priority_score"]


def test_kerja_lebih_tinggi_dari_personal():
    s_kerja    = scorer.score_task({"deadline": tgl(3), "importance": "high", "reschedule_count": 0, "category": "Kerja",    "type": "Tugas"})
    s_personal = scorer.score_task({"deadline": tgl(3), "importance": "high", "reschedule_count": 0, "category": "Personal", "type": "Tugas"})
    assert s_kerja["priority_score"] >= s_personal["priority_score"]


def test_personal_lebih_tinggi_dari_lainnya():
    s_personal = scorer.score_task({"deadline": tgl(3), "importance": "medium", "reschedule_count": 0, "category": "Personal", "type": "Tugas"})
    s_lainnya  = scorer.score_task({"deadline": tgl(3), "importance": "medium", "reschedule_count": 0, "category": "Lainnya",  "type": "Tugas"})
    assert s_personal["priority_score"] >= s_lainnya["priority_score"]


def test_tugas_lebih_tinggi_dari_acara():
    s_tugas = scorer.score_task({"deadline": tgl(3), "importance": "medium", "reschedule_count": 0, "category": "Personal", "type": "Tugas"})
    s_acara = scorer.score_task({"deadline": tgl(3), "importance": "medium", "reschedule_count": 0, "category": "Personal", "type": "Acara"})
    assert s_tugas["priority_score"] >= s_acara["priority_score"]


def test_deadline_hari_ini_score_tinggi():
    hasil = scorer.score_task({"deadline": tgl(0), "importance": "medium", "reschedule_count": 0, "category": "Personal", "type": "Tugas"})
    assert hasil["priority_score"] >= 70
    assert hasil["priority_label"] == "Tinggi"


def test_deadline_jauh_score_rendah():
    hasil = scorer.score_task({"deadline": tgl(30), "importance": "low", "reschedule_count": 0, "category": "Lainnya", "type": "Acara"})
    assert hasil["priority_score"] < 70


def test_priority_label_tinggi():
    hasil = scorer.score_task({"deadline": tgl(0), "importance": "high", "reschedule_count": 0, "category": "Akademik", "type": "Tugas"})
    assert hasil["priority_label"] == "Tinggi"


def test_priority_label_sedang():
    hasil = scorer.score_task({"deadline": tgl(5), "importance": "medium", "reschedule_count": 0, "category": "Personal", "type": "Acara"})
    assert hasil["priority_label"] in ["Sedang", "Rendah"]


def test_quadrant_do_first():
    hasil = scorer.score_task({"deadline": tgl(0), "importance": "high", "reschedule_count": 0, "category": "Akademik", "type": "Tugas"})
    assert hasil["quadrant"] == "DO_FIRST"


def test_reschedule_naikan_score():
    s_normal  = scorer.score_task({"deadline": tgl(7), "importance": "medium", "reschedule_count": 0, "category": "Personal", "type": "Tugas"})
    s_terlalu = scorer.score_task({"deadline": tgl(7), "importance": "medium", "reschedule_count": 3, "category": "Personal", "type": "Tugas"})
    assert s_terlalu["priority_score"] > s_normal["priority_score"]


def test_return_semua_fields():
    hasil = scorer.score_task({"deadline": tgl(1), "importance": "high", "reschedule_count": 0, "category": "Akademik", "type": "Tugas"})
    assert "priority_score"  in hasil
    assert "quadrant"        in hasil
    assert "priority_label"  in hasil
    assert "urgency"         in hasil
    assert "importance"      in hasil
