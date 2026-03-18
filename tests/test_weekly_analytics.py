import pytest
import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ai_engine.weekly_analytics import WeeklyAnalytics


def buat_data_dummy(analytics, user_id):
    """Helper generate data dummy satu minggu"""
    today = datetime.now()
    week_start = today - timedelta(days=today.weekday())

    categories = ["work", "academic", "personal", "health"]
    for i in range(8):
        tanggal = (week_start + timedelta(days=i % 7)).strftime("%Y-%m-%d")
        analytics.record_task(user_id, {
            "task_id": f"task_{i}",
            "title": f"Task {i}",
            "category": categories[i % 4],
            "status": "done" if i % 3 != 0 else "pending",
            "estimasi_menit": 60,
            "aktual_menit": 75 if i % 2 == 0 else 55,
            "tanggal": tanggal
        })
        analytics.record_focus_session(user_id, 25, tanggal)


def test_record_task_berhasil():
    """record_task dengan input valid harus berhasil"""
    analytics = WeeklyAnalytics()
    hasil = analytics.record_task("user_001", {
        "task_id": "task_001",
        "title": "Laporan Q1",
        "category": "work",
        "status": "done",
        "estimasi_menit": 60,
        "aktual_menit": 75,
        "tanggal": "2026-03-16"
    })
    assert hasil["success"] == True


def test_record_task_tanpa_id():
    """record_task tanpa task_id harus return error"""
    analytics = WeeklyAnalytics()
    hasil = analytics.record_task("user_001", {
        "title": "Task Tanpa ID",
        "category": "work",
        "status": "done",
        "tanggal": "2026-03-16"
    })
    assert hasil["success"] == False


def test_record_focus_session_berhasil():
    """record_focus_session dengan input valid harus berhasil"""
    analytics = WeeklyAnalytics()
    hasil = analytics.record_focus_session("user_001", 25, "2026-03-16")
    assert hasil["success"] == True


def test_record_focus_session_invalid():
    """Durasi 0 harus return error"""
    analytics = WeeklyAnalytics()
    hasil = analytics.record_focus_session("user_001", 0, "2026-03-16")
    assert hasil["success"] == False


def test_get_weekly_metrics_berhasil():
    """get_weekly_metrics harus berhasil dengan data"""
    analytics = WeeklyAnalytics()
    buat_data_dummy(analytics, "user_001")
    hasil = analytics.get_weekly_metrics("user_001")
    assert hasil["total_tasks"] > 0
    assert hasil["completion_rate"] is not None


def test_completion_rate_benar():
    """Completion rate harus dihitung dengan benar"""
    analytics = WeeklyAnalytics()
    today = datetime.now().strftime("%Y-%m-%d")
    for i in range(4):
        analytics.record_task("user_001", {
            "task_id": f"task_{i}",
            "title": f"Task {i}",
            "category": "work",
            "status": "done" if i < 3 else "pending",
            "estimasi_menit": 60,
            "aktual_menit": 60,
            "tanggal": today
        })
    hasil = analytics.get_weekly_metrics("user_001")
    assert hasil["completion_rate"] == 0.75


def test_distribusi_kategori_ada():
    """Distribusi kategori harus ada jika ada data"""
    analytics = WeeklyAnalytics()
    buat_data_dummy(analytics, "user_001")
    hasil = analytics.get_weekly_metrics("user_001")
    assert len(hasil["distribusi_kategori"]) > 0


def test_daily_completion_7_hari():
    """daily_completion harus berisi 7 hari"""
    analytics = WeeklyAnalytics()
    buat_data_dummy(analytics, "user_001")
    hasil = analytics.get_weekly_metrics("user_001")
    assert len(hasil["daily_completion"]) == 7


def test_return_fields_lengkap():
    """get_weekly_metrics harus return semua field"""
    analytics = WeeklyAnalytics()
    buat_data_dummy(analytics, "user_001")
    hasil = analytics.get_weekly_metrics("user_001")
    assert "week_start" in hasil
    assert "week_end" in hasil
    assert "completion_rate" in hasil
    assert "total_tasks" in hasil
    assert "tasks_done" in hasil
    assert "avg_focus_jam" in hasil
    assert "duration_accuracy" in hasil
    assert "distribusi_kategori" in hasil
    assert "daily_completion" in hasil
    assert "perbandingan_minggu_lalu" in hasil
