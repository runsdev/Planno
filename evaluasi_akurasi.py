"""
evaluasi_akurasi.py — Laporan evaluasi akurasi final AI Engine Planno
Jalankan: python evaluasi_akurasi.py
"""

import os
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ai_engine.nlp.task_parser import TaskParser
from ai_engine.prioritization.priority_scorer import PriorityScorer
from ai_engine.detection.procrastination import ProcrastinationDetector
from ai_engine.scheduling.time_blocker import TimeBlocker
from ai_engine.energy.energy_learner import EnergyLearner
from ai_engine.prediction.duration_predictor import DurationPredictor


def garis(char="=", panjang=55):
    print(char * panjang)


def header(judul):
    print()
    garis()
    print(f"  {judul}")
    garis()


def main():
    print()
    garis("*")
    print("  PLANNO AI ENGINE — LAPORAN EVALUASI AKURASI FINAL")
    print(f"  Tanggal: {datetime.now().strftime('%d %B %Y %H:%M')}")
    garis("*")

    hasil_evaluasi = {}

    # ─────────────────────────────────────────
    # EVALUASI 1: Task Parser (NLP)
    # ─────────────────────────────────────────
    header("1. EVALUASI SMART TASK INPUT (NLP Parser)")

    parser = TaskParser()
    test_cases = [
        {
            "input": "kerjakan laporan riset besok jam 2 siang selama 2 jam",
            "expected": {"has_title": True, "has_deadline": True, "duration": 120, "category": "academic"}
        },
        {
            "input": "meeting klien jumat pagi 1 jam",
            "expected": {"has_title": True, "has_deadline": True, "duration": 60, "category": "work"}
        },
        {
            "input": "beli obat hari ini",
            "expected": {"has_title": True, "has_deadline": True, "duration": None, "category": "personal"}
        },
        {
            "input": "jadwal periksa ke dokter besok",
            "expected": {"has_title": True, "has_deadline": True, "duration": None, "category": "health"}
        },
        {
            "input": "presentasi skripsi kamis jam 10 pagi 2 jam",
            "expected": {"has_title": True, "has_deadline": True, "duration": 120, "category": "academic"}
        },
    ]

    benar = 0
    total = len(test_cases)

    print(f"\n{'Input':<45} {'Status'}")
    garis("-")

    for tc in test_cases:
        hasil = parser.parse(tc["input"])
        exp = tc["expected"]

        checks = [
            hasil["success"] == True,
            (hasil.get("title") is not None) == exp["has_title"],
            (hasil.get("deadline") is not None) == exp["has_deadline"],
        ]

        if exp["duration"] is not None:
            checks.append(hasil.get("duration_minutes") == exp["duration"])

        semua_benar = all(checks)
        if semua_benar:
            benar += 1

        status = "✅ BENAR" if semua_benar else "⚠️ SEBAGIAN"
        input_short = tc["input"][:43] + ".." if len(tc["input"]) > 43 else tc["input"]
        print(f"{input_short:<45} {status}")

    akurasi_nlp = round(benar / total * 100, 1)
    target_nlp = 80.0
    print(f"\nAkurasi: {benar}/{total} ({akurasi_nlp}%) — Target: {target_nlp}%")
    print(f"Status : {'✅ TERCAPAI' if akurasi_nlp >= target_nlp else '⚠️ BELUM TERCAPAI'}")
    hasil_evaluasi["nlp_parser"] = {"akurasi": akurasi_nlp, "target": target_nlp, "tercapai": akurasi_nlp >= target_nlp}

    # ─────────────────────────────────────────
    # EVALUASI 2: Priority Scorer
    # ─────────────────────────────────────────
    header("2. EVALUASI AI TASK PRIORITIZATION")

    scorer = PriorityScorer()
    besok = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
    minggu_depan = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d %H:%M")
    bulan_depan = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d %H:%M")
    kemarin = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d %H:%M")

    priority_tests = [
        {"deadline": besok, "importance": "high", "reschedule_count": 0, "expected_quadrant": "DO_FIRST"},
        {"deadline": minggu_depan, "importance": "high", "reschedule_count": 0, "expected_quadrant": "SCHEDULE"},
        {"deadline": besok, "importance": "low", "reschedule_count": 0, "expected_quadrant": "DELEGATE"},
        {"deadline": bulan_depan, "importance": "low", "reschedule_count": 0, "expected_quadrant": "ELIMINATE"},
        {"deadline": kemarin, "importance": "medium", "reschedule_count": 0, "expected_quadrant": "DO_FIRST"},
    ]

    benar = 0
    total = len(priority_tests)

    print(f"\n{'Deadline':<12} {'Importance':<10} {'Expected':<15} {'Actual':<15} {'Status'}")
    garis("-")

    for tc in priority_tests:
        hasil = scorer.score_task(tc)
        benar_flag = hasil["quadrant"] == tc["expected_quadrant"]
        if benar_flag:
            benar += 1
        status = "✅" if benar_flag else "❌"
        deadline_label = "besok" if tc["deadline"] == besok else \
                         "kemarin" if tc["deadline"] == kemarin else \
                         "minggu depan" if tc["deadline"] == minggu_depan else "bulan depan"
        print(f"{deadline_label:<12} {tc['importance']:<10} {tc['expected_quadrant']:<15} {hasil['quadrant']:<15} {status}")

    akurasi_priority = round(benar / total * 100, 1)
    target_priority = 80.0
    print(f"\nAkurasi: {benar}/{total} ({akurasi_priority}%) — Target: {target_priority}%")
    print(f"Status : {'✅ TERCAPAI' if akurasi_priority >= target_priority else '⚠️ BELUM TERCAPAI'}")
    hasil_evaluasi["priority_scorer"] = {"akurasi": akurasi_priority, "target": target_priority, "tercapai": akurasi_priority >= target_priority}

    # ─────────────────────────────────────────
    # EVALUASI 3: Duration Predictor
    # ─────────────────────────────────────────
    header("3. EVALUASI DURATION PREDICTION")

    predictor = DurationPredictor()

    data_training = [
        ("academic", 60, 84), ("academic", 90, 126), ("academic", 120, 168),
        ("academic", 30, 42), ("academic", 45, 63), ("academic", 60, 90),
        ("work", 60, 72), ("work", 30, 36), ("work", 90, 108),
        ("work", 45, 54), ("work", 60, 70), ("work", 30, 35),
    ]

    for cat, est, act in data_training:
        predictor.record_actual("user_eval", cat, est, act)

    test_prediksi = [
        ("academic", 60, 84, 20),
        ("academic", 90, 126, 20),
        ("work", 60, 72, 20),
        ("work", 30, 36, 20),
    ]

    benar = 0
    total = len(test_prediksi)
    total_mae = 0

    print(f"\n{'Kategori':<12} {'Estimasi':>9} {'Aktual':>8} {'Prediksi':>10} {'Error':>7} {'Status'}")
    garis("-")

    for cat, est, aktual, toleransi in test_prediksi:
        hasil = predictor.predict("user_eval", cat, est)
        prediksi = hasil["prediksi_aktual"]
        error = abs(prediksi - aktual)
        total_mae += error
        benar_flag = error <= toleransi
        if benar_flag:
            benar += 1
        status = "✅" if benar_flag else "⚠️"
        print(f"{cat:<12} {est:>9} mnt {aktual:>6} mnt {prediksi:>8} mnt {error:>5} mnt {status}")

    mae = round(total_mae / total, 1)
    akurasi_duration = round(benar / total * 100, 1)
    target_mae = 20.0
    print(f"\nMAE (Mean Absolute Error): {mae} menit — Target: < {target_mae} menit")
    print(f"Akurasi (error < 20 mnt) : {benar}/{total} ({akurasi_duration}%)")
    print(f"Status : {'✅ TERCAPAI' if mae <= target_mae else '⚠️ BELUM TERCAPAI'}")
    hasil_evaluasi["duration_predictor"] = {"mae": mae, "target_mae": target_mae, "tercapai": mae <= target_mae}

    # ─────────────────────────────────────────
    # EVALUASI 4: Procrastination Detection
    # ─────────────────────────────────────────
    header("4. EVALUASI PROCRASTINATION DETECTION")

    detector = ProcrastinationDetector()
    kemarin_str = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    minggu_depan_str = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
    today_str = datetime.now().strftime("%Y-%m-%d")

    procras_tests = [
        {"title": "Task Normal", "deadline": minggu_depan_str, "reschedule_count": 0, "last_updated": today_str, "expected": False},
        {"title": "Task 3x Ditunda", "deadline": minggu_depan_str, "reschedule_count": 3, "last_updated": today_str, "expected": True},
        {"title": "Task Deadline Lewat", "deadline": kemarin_str, "reschedule_count": 0, "last_updated": today_str, "expected": True},
        {"title": "Task 5x Ditunda", "deadline": minggu_depan_str, "reschedule_count": 5, "last_updated": today_str, "expected": True},
        {"title": "Task Baru", "deadline": minggu_depan_str, "reschedule_count": 0, "last_updated": today_str, "expected": False},
    ]

    benar = 0
    total = len(procras_tests)

    print(f"\n{'Task':<25} {'Expected':<12} {'Actual':<12} {'Status'}")
    garis("-")

    for tc in procras_tests:
        hasil = detector.detect(tc)
        benar_flag = hasil["is_procrastinating"] == tc["expected"]
        if benar_flag:
            benar += 1
        status = "✅" if benar_flag else "❌"
        exp_label = "PROKRASTINASI" if tc["expected"] else "ON TRACK"
        act_label = "PROKRASTINASI" if hasil["is_procrastinating"] else "ON TRACK"
        print(f"{tc['title']:<25} {exp_label:<12} {act_label:<12} {status}")

    akurasi_procras = round(benar / total * 100, 1)
    target_procras = 90.0
    print(f"\nAkurasi: {benar}/{total} ({akurasi_procras}%) — Target: {target_procras}%")
    print(f"Status : {'✅ TERCAPAI' if akurasi_procras >= target_procras else '⚠️ BELUM TERCAPAI'}")
    hasil_evaluasi["procrastination"] = {"akurasi": akurasi_procras, "target": target_procras, "tercapai": akurasi_procras >= target_procras}

    # ─────────────────────────────────────────
    # EVALUASI 5: Energy Pattern
    # ─────────────────────────────────────────
    header("5. EVALUASI ENERGY PATTERN LEARNING")

    learner = EnergyLearner()

    print("\nTest cold start (user baru):")
    default = learner.get_peak_hours("user_baru_eval")
    peak_pagi = any(h in ["09:00", "10:00"] for h in default["peak_hours"])
    low_siang = any(h in ["13:00", "14:00"] for h in default["low_hours"])

    print(f"  Peak hours mengandung jam pagi (09/10): {'✅ YA' if peak_pagi else '❌ TIDAK'}")
    print(f"  Low hours mengandung jam siang (13/14): {'✅ YA' if low_siang else '❌ TIDAK'}")

    benar_energy = sum([peak_pagi, low_siang])
    akurasi_energy = round(benar_energy / 2 * 100, 1)
    target_energy = 70.0
    print(f"\nAkurasi: {benar_energy}/2 ({akurasi_energy}%) — Target: {target_energy}%")
    print(f"Status : {'✅ TERCAPAI' if akurasi_energy >= target_energy else '⚠️ BELUM TERCAPAI'}")
    hasil_evaluasi["energy_learner"] = {"akurasi": akurasi_energy, "target": target_energy, "tercapai": akurasi_energy >= target_energy}

    # ─────────────────────────────────────────
    # RINGKASAN FINAL
    # ─────────────────────────────────────────
    print()
    garis("*")
    print("  RINGKASAN EVALUASI FINAL")
    garis("*")

    print(f"\n{'Modul':<30} {'Metrik':<25} {'Status'}")
    garis("-")

    modul_labels = {
        "nlp_parser": ("Smart Task Input", f"Akurasi {hasil_evaluasi['nlp_parser']['akurasi']}%"),
        "priority_scorer": ("AI Prioritization", f"Akurasi {hasil_evaluasi['priority_scorer']['akurasi']}%"),
        "duration_predictor": ("Duration Prediction", f"MAE {hasil_evaluasi['duration_predictor']['mae']} mnt"),
        "procrastination": ("Procrastination Detection", f"Akurasi {hasil_evaluasi['procrastination']['akurasi']}%"),
        "energy_learner": ("Energy Pattern Learning", f"Akurasi {hasil_evaluasi['energy_learner']['akurasi']}%"),
    }

    semua_tercapai = True
    for key, (label, metrik) in modul_labels.items():
        tercapai = hasil_evaluasi[key]["tercapai"]
        if not tercapai:
            semua_tercapai = False
        status = "✅ TERCAPAI" if tercapai else "⚠️ BELUM"
        print(f"{label:<30} {metrik:<25} {status}")

    print()
    garis("*")
    if semua_tercapai:
        print("  ✅ SEMUA TARGET AKURASI TERCAPAI!")
        print("  AI Engine Planno siap untuk diintegrasikan")
    else:
        print("  ⚠️ BEBERAPA TARGET BELUM TERCAPAI")
        print("  Perlu penyempurnaan sebelum integrasi penuh")
    garis("*")
    print()


if __name__ == "__main__":
    main()
