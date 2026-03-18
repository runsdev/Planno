import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ai_engine.energy.energy_learner import EnergyLearner


def test_log_energy_berhasil():
    """Log energy level valid harus berhasil"""
    learner = EnergyLearner()
    hasil = learner.log_energy("user_001", "09:00", 5)
    assert hasil["success"] == True
    assert "berhasil" in hasil["message"]


def test_log_energy_invalid_level():
    """Energy level di luar 1-5 harus return error"""
    learner = EnergyLearner()
    hasil = learner.log_energy("user_001", "09:00", 6)
    assert hasil["success"] == False

    hasil2 = learner.log_energy("user_001", "09:00", 0)
    assert hasil2["success"] == False


def test_user_baru_pakai_default_pattern():
    """User baru tanpa data harus pakai default pattern"""
    learner = EnergyLearner()
    hasil = learner.get_peak_hours("user_baru_123")
    assert hasil["confidence"] == "low"
    assert len(hasil["peak_hours"]) == 3
    assert len(hasil["low_hours"]) == 3
    assert hasil["data_points"] == 0


def test_default_peak_hours_pagi():
    """Default pattern harus menunjukkan jam 09-10 sebagai peak"""
    learner = EnergyLearner()
    hasil = learner.get_peak_hours("user_baru_456")
    peak = hasil["peak_hours"]
    assert "09:00" in peak or "10:00" in peak


def test_get_energy_for_slot():
    """get_energy_for_slot harus return label yang benar"""
    learner = EnergyLearner()
    hasil = learner.get_energy_for_slot("user_001", "09:00")
    assert "jam" in hasil
    assert "energy_level" in hasil
    assert "label" in hasil
    assert hasil["label"] in ["tinggi", "sedang", "rendah"]


def test_energy_label_tinggi():
    """Jam 09:00 default harus label tinggi"""
    learner = EnergyLearner()
    hasil = learner.get_energy_for_slot("user_001", "09:00")
    assert hasil["label"] == "tinggi"


def test_energy_label_rendah():
    """Jam 13:00 default harus label rendah"""
    learner = EnergyLearner()
    hasil = learner.get_energy_for_slot("user_001", "13:00")
    assert hasil["label"] == "rendah"


def test_return_fields_lengkap():
    """get_peak_hours harus return semua field"""
    learner = EnergyLearner()
    hasil = learner.get_peak_hours("user_001")
    assert "peak_hours" in hasil
    assert "low_hours" in hasil
    assert "pattern" in hasil
    assert "confidence" in hasil
    assert "data_points" in hasil
