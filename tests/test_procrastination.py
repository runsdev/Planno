import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ai_engine.detection.procrastination import ProcrastinationDetector

detector = ProcrastinationDetector()


def test_tidak_ada_masalah():
    """Task normal tanpa penundaan → not procrastinating"""
    from datetime import datetime, timedelta
    minggu_depan = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
    hasil = detector.detect({
        "title": "Laporan Riset",
        "deadline": minggu_depan,
        "reschedule_count": 0,
        "last_updated": datetime.now().strftime("%Y-%m-%d")
    })
    assert hasil["is_procrastinating"] == False
    assert hasil["level"] == "none"
    assert hasil["recommendation"] is None


def test_reschedule_3_kali():
    """Reschedule 3 kali → procrastinating severe"""
    from datetime import datetime, timedelta
    minggu_depan = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
    hasil = detector.detect({
        "title": "Update Portfolio",
        "deadline": minggu_depan,
        "reschedule_count": 3,
        "last_updated": datetime.now().strftime("%Y-%m-%d")
    })
    assert hasil["is_procrastinating"] == True
    assert hasil["level"] == "severe"
    assert hasil["recommendation"] is not None


def test_reschedule_5_kali():
    """Reschedule 5 kali → procrastinating severe"""
    from datetime import datetime, timedelta
    minggu_depan = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
    hasil = detector.detect({
        "title": "Skripsi",
        "deadline": minggu_depan,
        "reschedule_count": 5,
        "last_updated": datetime.now().strftime("%Y-%m-%d")
    })
    assert hasil["is_procrastinating"] == True
    assert hasil["level"] == "severe"


def test_deadline_terlewat():
    """Deadline sudah lewat → procrastinating severe"""
    from datetime import datetime, timedelta
    kemarin = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    hasil = detector.detect({
        "title": "Laporan Q1",
        "deadline": kemarin,
        "reschedule_count": 0,
        "last_updated": datetime.now().strftime("%Y-%m-%d")
    })
    assert hasil["is_procrastinating"] == True
    assert hasil["level"] == "severe"


def test_reschedule_1_kali():
    """Reschedule 1 kali → peringatan mild tapi belum procrastinating"""
    from datetime import datetime, timedelta
    minggu_depan = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
    hasil = detector.detect({
        "title": "Meeting Klien",
        "deadline": minggu_depan,
        "reschedule_count": 1,
        "last_updated": datetime.now().strftime("%Y-%m-%d")
    })
    assert hasil["is_procrastinating"] == False
    assert hasil["level"] == "mild"


def test_tanpa_deadline():
    """Task tanpa deadline → tetap bisa dideteksi"""
    hasil = detector.detect({
        "title": "Belajar Python",
        "deadline": None,
        "reschedule_count": 0,
        "last_updated": None
    })
    assert hasil["is_procrastinating"] == False
    assert "level" in hasil


def test_return_fields_lengkap():
    """Response harus selalu punya semua field"""
    hasil = detector.detect({
        "title": "Test Task",
        "deadline": None,
        "reschedule_count": 0,
        "last_updated": None
    })
    assert "is_procrastinating" in hasil
    assert "level" in hasil
    assert "reason" in hasil
    assert "recommendation" in hasil


def test_get_procrastinating_tasks():
    """Filter tasks yang procrastinating dari list"""
    from datetime import datetime, timedelta
    kemarin = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    minggu_depan = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")

    tasks = [
        {
            "title": "Task Normal",
            "deadline": minggu_depan,
            "reschedule_count": 0,
            "last_updated": datetime.now().strftime("%Y-%m-%d")
        },
        {
            "title": "Task Terlambat",
            "deadline": kemarin,
            "reschedule_count": 0,
            "last_updated": datetime.now().strftime("%Y-%m-%d")
        },
        {
            "title": "Task Sering Ditunda",
            "deadline": minggu_depan,
            "reschedule_count": 4,
            "last_updated": datetime.now().strftime("%Y-%m-%d")
        }
    ]

    hasil = detector.get_procrastinating_tasks(tasks)
    assert len(hasil) == 2
    titles = [t["title"] for t in hasil]
    assert "Task Terlambat" in titles
    assert "Task Sering Ditunda" in titles
    assert "Task Normal" not in titles
