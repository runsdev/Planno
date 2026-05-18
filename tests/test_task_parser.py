import pytest
import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.ai_engine.nlp.task_parser import TaskParser

parser = TaskParser()


def test_parse_input_kosong():
    hasil = parser.parse("")
    assert hasil["success"] == False
    assert "kosong" in hasil["error"].lower()


def test_parse_input_spasi():
    hasil = parser.parse("   ")
    assert hasil["success"] == False


def test_parse_deadline_besok():
    """AI harus bisa memahami kata besok"""
    hasil = parser.parse("kerjakan laporan besok jam 2 siang")
    assert hasil["success"] == True
    besok = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    assert besok in hasil["deadline"]


def test_parse_deadline_lusa():
    """AI harus bisa memahami kata lusa"""
    hasil = parser.parse("submit tugas lusa jam 23.59")
    assert hasil["success"] == True
    lusa = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
    assert lusa in hasil["deadline"]


def test_parse_deadline_hari_ini():
    hasil = parser.parse("kumpulkan laporan hari ini jam 5 sore")
    assert hasil["success"] == True
    today = datetime.now().strftime("%Y-%m-%d")
    assert today in hasil["deadline"]


def test_parse_title_tidak_diubah_main():
    """Bug fix: main sama teman tidak boleh jadi makan bersama teman"""
    hasil = parser.parse("main sama teman ke pakuwon jam 21.00 sampai 23.00")
    assert hasil["success"] == True
    assert "main" in hasil["title"].lower()
    assert "makan" not in hasil["title"].lower()


def test_parse_title_tidak_diubah_beli_kopi():
    """Bug fix: beli kopi tidak boleh diubah jadi membeli minuman"""
    hasil = parser.parse("beli kopi di warung besok pagi")
    assert hasil["success"] == True
    assert "kopi" in hasil["title"].lower()


def test_parse_type_acara_main():
    """main adalah Acara bukan Tugas"""
    hasil = parser.parse("main sama teman ke pakuwon besok jam 21.00")
    assert hasil["success"] == True
    assert hasil["type"] == "Acara"


def test_parse_type_acara_nonton():
    """nonton adalah Acara"""
    hasil = parser.parse("nonton film di bioskop sabtu malam")
    assert hasil["success"] == True
    assert hasil["type"] == "Acara"


def test_parse_type_tugas_laporan():
    """kerjakan laporan adalah Tugas"""
    hasil = parser.parse("kerjakan laporan capstone besok jam 10")
    assert hasil["success"] == True
    assert hasil["type"] == "Tugas"


def test_parse_kategori_personal_main():
    hasil = parser.parse("main sama teman ke pakuwon jam 21.00 sampai 23.00")
    assert hasil["success"] == True
    assert hasil["category"] == "Personal"


def test_parse_kategori_akademik():
    hasil = parser.parse("kerjakan skripsi bab 3 besok jam 10 pagi")
    assert hasil["success"] == True
    assert hasil["category"] == "Akademik"


def test_parse_kategori_kerja():
    hasil = parser.parse("meeting dengan klien besok jam 9 pagi")
    assert hasil["success"] == True
    assert hasil["category"] == "Kerja"


def test_parse_durasi_dari_sampai():
    """jam 21.00 sampai 23.00 = 120 menit"""
    hasil = parser.parse("main sama teman ke pakuwon jam 21.00 sampai 23.00")
    assert hasil["success"] == True
    assert hasil["duration_minutes"] == 120


def test_parse_importance_akademik_high():
    """Akademik harus dapat importance high"""
    hasil = parser.parse("belajar untuk ujian besok")
    assert hasil["success"] == True
    assert hasil["importance"] == "high"


def test_parse_importance_personal_medium():
    """Personal harus dapat importance medium"""
    hasil = parser.parse("jalan-jalan sama keluarga hari minggu")
    assert hasil["success"] == True
    assert hasil["importance"] == "medium"


def test_parse_return_semua_fields():
    hasil = parser.parse("meeting dengan dosen besok jam 10")
    assert hasil["success"] == True
    for field in ["title", "type", "deadline", "duration_minutes", "category", "importance"]:
        assert field in hasil
