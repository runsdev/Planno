import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ai_engine.scheduling.time_blocker import TimeBlocker

blocker = TimeBlocker()

TASKS_DUMMY = [
    {
        "task_id": "task_001",
        "title": "Laporan Q1 Marketing",
        "duration_minutes": 90,
        "priority_score": 95,
        "category": "work"
    },
    {
        "task_id": "task_002",
        "title": "Review Desain UI",
        "duration_minutes": 60,
        "priority_score": 80,
        "category": "work"
    },
    {
        "task_id": "task_003",
        "title": "Reply Email Partner",
        "duration_minutes": 30,
        "priority_score": 50,
        "category": "work"
    },
    {
        "task_id": "task_004",
        "title": "Update LinkedIn",
        "duration_minutes": 20,
        "priority_score": 15,
        "category": "personal"
    }
]


def test_generate_schedule_berhasil():
    """generate_schedule harus menghasilkan jadwal dengan blocks"""
    hasil = blocker.generate_schedule(TASKS_DUMMY, "08:00", "17:00")
    assert hasil["date"] is not None
    assert len(hasil["blocks"]) > 0
    assert hasil["total_tasks"] > 0


def test_urutan_berdasarkan_prioritas():
    """Task dengan priority tertinggi harus dijadwalkan pertama"""
    hasil = blocker.generate_schedule(TASKS_DUMMY, "08:00", "17:00")
    focus_blocks = [b for b in hasil["blocks"] if b["block_type"] == "focus"]
    assert focus_blocks[0]["title"] == "Laporan Q1 Marketing"


def test_ada_break_setelah_90_menit():
    """Harus ada break setelah 90 menit kerja"""
    hasil = blocker.generate_schedule(TASKS_DUMMY, "08:00", "17:00")
    break_blocks = [b for b in hasil["blocks"] if b["block_type"] == "break"]
    assert len(break_blocks) >= 1


def test_tidak_melebihi_jam_kerja():
    """Semua blocks harus selesai sebelum atau tepat jam kerja berakhir"""
    hasil = blocker.generate_schedule(TASKS_DUMMY, "08:00", "17:00")
    for block in hasil["blocks"]:
        assert block["end"] <= "17:00"


def test_jam_mulai_pertama():
    """Block pertama harus mulai tepat di jam kerja awal"""
    hasil = blocker.generate_schedule(TASKS_DUMMY, "08:00", "17:00")
    assert hasil["blocks"][0]["start"] == "08:00"


def test_return_fields_lengkap():
    """Response harus punya semua field yang dibutuhkan"""
    hasil = blocker.generate_schedule(TASKS_DUMMY, "08:00", "17:00")
    assert "date" in hasil
    assert "blocks" in hasil
    assert "total_tasks" in hasil
    assert "total_jam_kerja" in hasil


def test_task_tanpa_durasi():
    """Task tanpa duration_minutes harus pakai durasi default 60 menit"""
    tasks = [{
        "task_id": "task_x",
        "title": "Task Tanpa Durasi",
        "duration_minutes": None,
        "priority_score": 80,
        "category": "work"
    }]
    hasil = blocker.generate_schedule(tasks, "08:00", "17:00")
    focus_blocks = [b for b in hasil["blocks"] if b["block_type"] == "focus"]
    assert focus_blocks[0]["duration_minutes"] == 60


def test_smart_reschedule_sisipkan_task_baru():
    """smart_reschedule harus bisa menyisipkan task baru ke jadwal"""
    jadwal = blocker.generate_schedule(TASKS_DUMMY, "08:00", "17:00")

    task_baru = {
        "task_id": "task_new",
        "title": "Meeting Mendadak",
        "duration_minutes": 30,
        "priority_score": 90,
        "category": "work"
    }

    hasil = blocker.smart_reschedule(jadwal, task_baru)
    assert "updated_schedule" in hasil
    assert "changes" in hasil
    assert len(hasil["changes"]) > 0

    titles = [b["title"] for b in hasil["updated_schedule"]["blocks"]]
    assert "Meeting Mendadak" in titles
