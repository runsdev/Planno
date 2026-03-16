import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ai_engine.nlp.task_parser import TaskParser

parser = TaskParser()


def test_parse_input_kosong():
    """Input kosong harus return error"""
    hasil = parser.parse("")
    assert hasil["success"] == False
    assert hasil["error"] == "Input tidak boleh kosong"


def test_parse_input_spasi():
    """Input spasi saja harus return error"""
    hasil = parser.parse("   ")
    assert hasil["success"] == False
    assert hasil["error"] == "Input tidak boleh kosong"


def test_parse_ada_deadline():
    """Input dengan deadline harus berhasil diekstrak"""
    hasil = parser.parse("kerjakan laporan riset besok jam 2 siang selama 2 jam")
    assert hasil["success"] == True
    assert hasil["title"] is not None
    assert hasil["deadline"] is not None
    assert hasil["duration_minutes"] == 120


def test_parse_tanpa_durasi():
    """Input tanpa durasi harus return duration_minutes null"""
    hasil = parser.parse("beli obat hari ini")
    assert hasil["success"] == True
    assert hasil["title"] is not None
    assert hasil["duration_minutes"] is None


def test_parse_kategori_work():
    """Input meeting klien harus kategori work"""
    hasil = parser.parse("meeting klien jumat pagi 1 jam")
    assert hasil["success"] == True
    assert hasil["category"] == "work"


def test_parse_kategori_health():
    """Input olahraga harus kategori health"""
    hasil = parser.parse("olahraga 30 menit")
    assert hasil["success"] == True
    assert hasil["category"] == "health"


def test_parse_kategori_academic():
    """Input tugas kuliah harus kategori academic"""
    hasil = parser.parse("kerjakan tugas kuliah besok")
    assert hasil["success"] == True
    assert hasil["category"] == "academic"


def test_parse_return_fields_lengkap():
    """Response harus selalu punya semua field yang dibutuhkan"""
    hasil = parser.parse("presentasi skripsi kamis jam 10 pagi")
    assert "success" in hasil
    assert "title" in hasil
    assert "deadline" in hasil
    assert "duration_minutes" in hasil
    assert "category" in hasil
    assert "error" in hasil
