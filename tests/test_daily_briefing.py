import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ai_engine.nlp.daily_briefing import DailyBriefingGenerator

generator = DailyBriefingGenerator()

TASKS_DUMMY = [
    {
        "title": "Laporan Q1 Marketing",
        "deadline": "2026-03-17 17:00",
        "priority_score": 95,
        "category": "work"
    },
    {
        "title": "Review Desain UI",
        "deadline": "2026-03-18 12:00",
        "priority_score": 80,
        "category": "work"
    },
    {
        "title": "Belajar Machine Learning",
        "deadline": "2026-03-20 00:00",
        "priority_score": 60,
        "category": "academic"
    }
]


def test_generate_berhasil():
    """generate() harus berhasil dengan input lengkap"""
    hasil = generator.generate(
        user_name="Desi",
        top_tasks=TASKS_DUMMY,
        peak_hours=["09:00", "10:00", "11:00"],
        completion_rate=0.78
    )
    assert hasil["success"] == True
    assert hasil["briefing_text"] is not None
    assert len(hasil["briefing_text"]) > 0


def test_generate_mengandung_nama_user():
    """Briefing harus menyebut nama user"""
    hasil = generator.generate(
        user_name="Desi",
        top_tasks=TASKS_DUMMY,
        peak_hours=["09:00", "10:00", "11:00"]
    )
    assert hasil["success"] == True
    assert "Desi" in hasil["briefing_text"]


def test_generate_tanpa_task():
    """generate() tanpa task harus return error"""
    hasil = generator.generate(
        user_name="Desi",
        top_tasks=[],
        peak_hours=["09:00", "10:00"]
    )
    assert hasil["success"] == False
    assert hasil["briefing_text"] is None


def test_generate_dengan_procrastination():
    """generate() dengan procrastination flags harus tetap berhasil"""
    prokrastinasi = [{"title": "Update Portfolio"}]
    hasil = generator.generate(
        user_name="Desi",
        top_tasks=TASKS_DUMMY,
        peak_hours=["09:00", "10:00", "11:00"],
        procrastination_flags=prokrastinasi
    )
    assert hasil["success"] == True
    assert hasil["briefing_text"] is not None


def test_generate_simple():
    """generate_simple() harus return string teks"""
    hasil = generator.generate_simple("Desi", TASKS_DUMMY)
    assert isinstance(hasil, str)
    assert len(hasil) > 0


def test_return_fields_lengkap():
    """generate() harus return semua field yang dibutuhkan"""
    hasil = generator.generate(
        user_name="Desi",
        top_tasks=TASKS_DUMMY,
        peak_hours=["09:00", "10:00", "11:00"]
    )
    assert "success" in hasil
    assert "briefing_text" in hasil
    assert "top_tasks" in hasil
    assert "peak_hours" in hasil
    assert "generated_at" in hasil


def test_top_tasks_maksimal_3():
    """Meskipun input lebih dari 3 task, output hanya 3"""
    banyak_tasks = TASKS_DUMMY + [
        {"title": "Task Extra 1", "deadline": None,
         "priority_score": 30, "category": "personal"},
        {"title": "Task Extra 2", "deadline": None,
         "priority_score": 20, "category": "personal"}
    ]
    hasil = generator.generate(
        user_name="Desi",
        top_tasks=banyak_tasks,
        peak_hours=["09:00", "10:00", "11:00"]
    )
    assert len(hasil["top_tasks"]) <= 3
