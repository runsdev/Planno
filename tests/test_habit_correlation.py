import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ai_engine.energy.habit_correlation import HabitCorrelationAnalyzer


def buat_data_dummy(analyzer, user_id, jumlah_hari=10):
    """Helper untuk generate data dummy dengan pola korelasi jelas"""
    for i in range(jumlah_hari):
        tidur = 8 if i % 2 == 0 else 5
        completion = 0.9 if i % 2 == 0 else 0.4
        analyzer.record_day(
            user_id=user_id,
            tanggal=f"2026-03-{i+1:02d}",
            habits={
                "tidur_jam": tidur,
                "olahraga": i % 3 == 0,
                "meditasi": True
            },
            completion_rate=completion
        )


def test_record_day_berhasil():
    """record_day dengan input valid harus berhasil"""
    analyzer = HabitCorrelationAnalyzer()
    hasil = analyzer.record_day(
        user_id="user_001",
        tanggal="2026-03-16",
        habits={"tidur_jam": 8, "olahraga": True},
        completion_rate=0.85
    )
    assert hasil["success"] == True
    assert "berhasil" in hasil["message"]


def test_record_day_completion_invalid():
    """Completion rate di luar 0-1 harus return error"""
    analyzer = HabitCorrelationAnalyzer()
    hasil = analyzer.record_day(
        user_id="user_001",
        tanggal="2026-03-16",
        habits={"tidur_jam": 8},
        completion_rate=1.5
    )
    assert hasil["success"] == False

    hasil2 = analyzer.record_day(
        user_id="user_001",
        tanggal="2026-03-16",
        habits={"tidur_jam": 8},
        completion_rate=-0.1
    )
    assert hasil2["success"] == False


def test_get_insights_data_kurang():
    """get_insights dengan data < 7 hari harus return error"""
    analyzer = HabitCorrelationAnalyzer()
    for i in range(3):
        analyzer.record_day(
            user_id="user_001",
            tanggal=f"2026-03-{i+1:02d}",
            habits={"tidur_jam": 8},
            completion_rate=0.8
        )
    hasil = analyzer.get_insights("user_001")
    assert hasil["success"] == False
    assert hasil["data_points"] == 3


def test_get_insights_berhasil():
    """get_insights dengan data cukup harus berhasil"""
    analyzer = HabitCorrelationAnalyzer()
    buat_data_dummy(analyzer, "user_001", 10)
    hasil = analyzer.get_insights("user_001")
    assert hasil["success"] == True
    assert "correlations" in hasil
    assert "insights" in hasil
    assert hasil["data_points"] == 10


def test_korelasi_tidur_positif():
    """Tidur lebih banyak harus berkorelasi positif dengan produktivitas"""
    analyzer = HabitCorrelationAnalyzer()
    buat_data_dummy(analyzer, "user_001", 10)
    hasil = analyzer.get_insights("user_001")
    assert "tidur_jam" in hasil["correlations"]
    assert hasil["correlations"]["tidur_jam"] > 0


def test_get_best_habit_data_kurang():
    """get_best_habit tanpa data cukup harus return None"""
    analyzer = HabitCorrelationAnalyzer()
    hasil = analyzer.get_best_habit("user_baru")
    assert hasil["habit_name"] is None
    assert hasil["correlation"] is None


def test_get_best_habit_berhasil():
    """get_best_habit dengan data cukup harus return habit terbaik"""
    analyzer = HabitCorrelationAnalyzer()
    buat_data_dummy(analyzer, "user_001", 10)
    hasil = analyzer.get_best_habit("user_001")
    assert hasil["habit_name"] is not None
    assert hasil["correlation"] is not None
    assert hasil["insight_text"] is not None


def test_return_fields_lengkap():
    """get_insights harus return semua field"""
    analyzer = HabitCorrelationAnalyzer()
    buat_data_dummy(analyzer, "user_001", 10)
    hasil = analyzer.get_insights("user_001")
    assert "success" in hasil
    assert "insights" in hasil
    assert "correlations" in hasil
    assert "data_points" in hasil
    assert "confidence" in hasil
