import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ai_engine.prediction.duration_predictor import DurationPredictor


def test_record_actual_berhasil():
    """Record durasi aktual valid harus berhasil"""
    predictor = DurationPredictor()
    hasil = predictor.record_actual("user_001", "academic", 60, 85)
    assert hasil["success"] == True
    assert "berhasil" in hasil["message"]


def test_record_actual_invalid():
    """Durasi 0 atau negatif harus return error"""
    predictor = DurationPredictor()
    hasil = predictor.record_actual("user_001", "academic", 0, 85)
    assert hasil["success"] == False

    hasil2 = predictor.record_actual("user_001", "academic", 60, -10)
    assert hasil2["success"] == False


def test_predict_user_baru_pakai_default():
    """User baru tanpa histori harus pakai default correction factor"""
    predictor = DurationPredictor()
    hasil = predictor.predict("user_baru", "academic", 60)
    assert hasil["prediksi_aktual"] > 60
    assert hasil["confidence"] == "low"
    assert hasil["estimasi_user"] == 60


def test_predict_academic_lebih_lama():
    """Prediksi academic harus lebih lama dari estimasi (factor 1.4)"""
    predictor = DurationPredictor()
    hasil = predictor.predict("user_001", "academic", 60)
    assert hasil["prediksi_aktual"] == 84


def test_predict_health_sama():
    """Prediksi health harus sama dengan estimasi (factor 1.0)"""
    predictor = DurationPredictor()
    hasil = predictor.predict("user_001", "health", 30)
    assert hasil["prediksi_aktual"] == 30


def test_predict_belajar_dari_histori():
    """Setelah 5+ data, prediksi harus pakai histori user"""
    predictor = DurationPredictor()
    for _ in range(6):
        predictor.record_actual("user_001", "work", 60, 90)

    hasil = predictor.predict("user_001", "work", 60)
    assert hasil["confidence"] in ["medium", "high"]
    assert hasil["correction_factor"] == 1.5
    assert hasil["prediksi_aktual"] == 90


def test_get_accuracy_report_user_baru():
    """User baru tanpa histori harus return None"""
    predictor = DurationPredictor()
    hasil = predictor.get_accuracy_report("user_baru_999")
    assert hasil["total_tasks"] == 0
    assert hasil["rata_rata_rasio"] is None
    assert hasil["akurasi_persen"] is None


def test_get_accuracy_report_dengan_data():
    """Accuracy report harus return semua field dengan benar"""
    predictor = DurationPredictor()
    predictor.record_actual("user_001", "academic", 60, 84)
    predictor.record_actual("user_001", "work", 30, 36)
    predictor.record_actual("user_001", "academic", 120, 168)

    hasil = predictor.get_accuracy_report("user_001")
    assert hasil["total_tasks"] == 3
    assert hasil["rata_rata_rasio"] is not None
    assert hasil["kategori_paling_meleset"] is not None
    assert hasil["akurasi_persen"] is not None


def test_return_fields_lengkap():
    """predict harus return semua field"""
    predictor = DurationPredictor()
    hasil = predictor.predict("user_001", "academic", 60)
    assert "estimasi_user" in hasil
    assert "prediksi_aktual" in hasil
    assert "correction_factor" in hasil
    assert "confidence" in hasil
    assert "pesan" in hasil
    assert "data_points" in hasil
