"""
demo.py — Demo lengkap AI Engine Planno
Jalankan: python demo.py
"""

import os
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ai_engine.nlp.task_parser import TaskParser
from ai_engine.nlp.daily_briefing import DailyBriefingGenerator
from ai_engine.prioritization.priority_scorer import PriorityScorer
from ai_engine.detection.procrastination import ProcrastinationDetector
from ai_engine.scheduling.time_blocker import TimeBlocker
from ai_engine.energy.energy_learner import EnergyLearner
from ai_engine.energy.habit_correlation import HabitCorrelationAnalyzer
from ai_engine.prediction.duration_predictor import DurationPredictor
from ai_engine.weekly_analytics import WeeklyAnalytics


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
    print("  PLANNO — AI ENGINE DEMO")
    print("  Intelligent Planner untuk Produktivitas Optimal")
    garis("*")

    # ─────────────────────────────────────────
    # DEMO 1: Smart Task Input
    # ─────────────────────────────────────────
    header("1. SMART TASK INPUT (NLP Parser)")

    parser = TaskParser()
    kalimat_test = [
        "kerjakan laporan riset besok jam 2 siang selama 2 jam",
        "meeting klien jumat pagi 1 jam",
        "jadwal periksa ke dokter minggu depan jam 9"
    ]

    for kalimat in kalimat_test:
        print(f"\nInput : \"{kalimat}\"")
        hasil = parser.parse(kalimat)
        if hasil["success"]:
            print(f"  Title    : {hasil['title']}")
            print(f"  Deadline : {hasil['deadline']}")
            print(f"  Durasi   : {hasil['duration_minutes']} menit")
            print(f"  Kategori : {hasil['category']}")
        else:
            print(f"  Error: {hasil['error']}")

    # ─────────────────────────────────────────
    # DEMO 2: AI Task Prioritization
    # ─────────────────────────────────────────
    header("2. AI TASK PRIORITIZATION (Eisenhower Matrix)")

    scorer = PriorityScorer()
    besok = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
    minggu_depan = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d %H:%M")
    bulan_depan = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d %H:%M")

    tasks_demo = [
        {"nama": "Laporan Q1", "deadline": besok, "importance": "high", "reschedule_count": 0},
        {"nama": "Belajar ML", "deadline": minggu_depan, "importance": "high", "reschedule_count": 0},
        {"nama": "Reply Email", "deadline": besok, "importance": "low", "reschedule_count": 0},
        {"nama": "Update LinkedIn", "deadline": bulan_depan, "importance": "low", "reschedule_count": 0},
    ]

    print(f"\n{'Task':<20} {'Score':>6} {'Kuadran':<15} {'Urgency'}")
    garis("-")
    for task in tasks_demo:
        hasil = scorer.score_task(task)
        print(f"{task['nama']:<20} {hasil['priority_score']:>6} {hasil['quadrant']:<15} {hasil['urgency']}")

    # ─────────────────────────────────────────
    # DEMO 3: Intelligent Time Blocking
    # ─────────────────────────────────────────
    header("3. INTELLIGENT TIME BLOCKING")

    blocker = TimeBlocker()
    tasks_jadwal = []
    for i, task in enumerate(tasks_demo):
        hasil = scorer.score_task(task)
        tasks_jadwal.append({
            "task_id": f"task_{i}",
            "title": task["nama"],
            "duration_minutes": 60,
            "priority_score": hasil["priority_score"],
            "category": "work"
        })

    jadwal = blocker.generate_schedule(tasks_jadwal, "08:00", "17:00")
    print(f"\nJadwal hari ini ({jadwal['date']}):")
    print(f"{'Waktu':<15} {'Tipe':<8} {'Task'}")
    garis("-")
    for block in jadwal["blocks"]:
        waktu = f"{block['start']}–{block['end']}"
        tipe = block["block_type"]
        judul = block["title"] or "-"
        print(f"{waktu:<15} {tipe:<8} {judul}")
    print(f"\nTotal: {jadwal['total_tasks']} tasks, {jadwal['total_jam_kerja']} jam kerja")

    # ─────────────────────────────────────────
    # DEMO 4: Energy Pattern Learning
    # ─────────────────────────────────────────
    header("4. ENERGY PATTERN LEARNING")

    learner = EnergyLearner()
    print("\nUser baru (cold start) — pakai default pattern:")
    default = learner.get_peak_hours("user_baru")
    print(f"  Peak hours : {', '.join(default['peak_hours'])}")
    print(f"  Low hours  : {', '.join(default['low_hours'])}")
    print(f"  Confidence : {default['confidence']}")

    print("\nCek energi per slot waktu:")
    for jam in ["09:00", "13:00", "16:00"]:
        slot = learner.get_energy_for_slot("user_baru", jam)
        print(f"  Jam {jam} → energi {slot['label']}")

    # ─────────────────────────────────────────
    # DEMO 5: Duration Prediction
    # ─────────────────────────────────────────
    header("5. REALISTIC DURATION PREDICTION")

    predictor = DurationPredictor()
    print("\nUser baru (pakai default correction factor):")
    for cat, estimasi in [("academic", 60), ("work", 30), ("health", 45)]:
        hasil = predictor.predict("user_001", cat, estimasi)
        print(f"  {cat:<10} estimasi {estimasi} mnt → prediksi {hasil['prediksi_aktual']} mnt (faktor {hasil['correction_factor']}x)")

    print("\nSetelah 6x data historis (work selalu 1.5x estimasi):")
    for _ in range(6):
        predictor.record_actual("user_001", "work", 60, 90)
    hasil = predictor.predict("user_001", "work", 60)
    print(f"  work estimasi 60 mnt → prediksi {hasil['prediksi_aktual']} mnt")
    print(f"  Confidence: {hasil['confidence']}")

    # ─────────────────────────────────────────
    # DEMO 6: Procrastination Detection
    # ─────────────────────────────────────────
    header("6. PROCRASTINATION DETECTION")

    detector = ProcrastinationDetector()
    kemarin = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    minggu_depan_str = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")

    test_cases = [
        {"title": "Task Normal", "deadline": minggu_depan_str, "reschedule_count": 0, "last_updated": datetime.now().strftime("%Y-%m-%d")},
        {"title": "Task Sering Ditunda", "deadline": minggu_depan_str, "reschedule_count": 4, "last_updated": datetime.now().strftime("%Y-%m-%d")},
        {"title": "Task Deadline Lewat", "deadline": kemarin, "reschedule_count": 0, "last_updated": datetime.now().strftime("%Y-%m-%d")},
    ]

    print()
    for task in test_cases:
        hasil = detector.detect(task)
        status = "🚨 PROKRASTINASI" if hasil["is_procrastinating"] else "✅ ON TRACK"
        print(f"  {task['title']:<25} → {status} ({hasil['level']})")
        if hasil["recommendation"]:
            print(f"    Saran: {hasil['recommendation']}")

    # ─────────────────────────────────────────
    # DEMO 7: Habit Correlation
    # ─────────────────────────────────────────
    header("7. HABIT CORRELATION ANALYSIS")

    analyzer = HabitCorrelationAnalyzer()
    for i in range(10):
        tidur = 8 if i % 2 == 0 else 5
        completion = 0.9 if i % 2 == 0 else 0.4
        analyzer.record_day(
            user_id="user_001",
            tanggal=f"2026-03-{i+1:02d}",
            habits={"tidur_jam": tidur, "olahraga": i % 3 == 0, "meditasi": True},
            completion_rate=completion
        )

    best = analyzer.get_best_habit("user_001")
    print(f"\nHabit terbaik: {best['habit_name']}")
    print(f"Korelasi     : {best['correlation']}")
    print(f"Insight      : {best['insight_text']}")

    insights = analyzer.get_insights("user_001")
    print(f"\nSemua insight ({insights['confidence']} confidence):")
    for insight in insights["insights"]:
        print(f"  • {insight}")

    # ─────────────────────────────────────────
    # DEMO 8: Weekly Analytics
    # ─────────────────────────────────────────
    header("8. WEEKLY ANALYTICS")

    analytics = WeeklyAnalytics()
    today = datetime.now()
    week_start = today - timedelta(days=today.weekday())

    for i in range(6):
        tanggal = (week_start + timedelta(days=i)).strftime("%Y-%m-%d")
        analytics.record_task("user_001", {
            "task_id": f"t{i}",
            "title": f"Task {i}",
            "category": ["work", "academic", "personal"][i % 3],
            "status": "done" if i % 4 != 0 else "pending",
            "estimasi_menit": 60,
            "aktual_menit": 75,
            "tanggal": tanggal
        })
        analytics.record_focus_session("user_001", 25, tanggal)

    metrics = analytics.get_weekly_metrics("user_001")
    print(f"\nMinggu {metrics['week_start']} s/d {metrics['week_end']}:")
    print(f"  Completion rate  : {round(metrics['completion_rate']*100)}%")
    print(f"  Total tasks      : {metrics['total_tasks']}")
    print(f"  Tasks selesai    : {metrics['tasks_done']}")
    print(f"  Avg fokus/hari   : {metrics['avg_focus_jam']} jam")
    if metrics['duration_accuracy']:
        print(f"  Akurasi estimasi : {round(metrics['duration_accuracy']*100)}%")

    print("\nDistribusi waktu:")
    for cat, data in metrics["distribusi_kategori"].items():
        print(f"  {cat:<12} : {data['total_menit']} mnt ({data['persen']}%)")

    # ─────────────────────────────────────────
    # DEMO 9: Daily Briefing
    # ─────────────────────────────────────────
    header("9. DAILY BRIEFING (AI Generated)")

    generator = DailyBriefingGenerator()
    top_tasks = [
        {"title": "Laporan Q1", "deadline": besok, "priority_score": 95, "category": "work"},
        {"title": "Meeting Klien", "deadline": besok, "priority_score": 80, "category": "work"},
        {"title": "Belajar ML", "deadline": minggu_depan, "priority_score": 60, "category": "academic"},
    ]

    print("\nMenggenerate briefing...")
    briefing = generator.generate(
        user_name="Desi",
        top_tasks=top_tasks,
        peak_hours=["09:00", "10:00", "11:00"],
        completion_rate=0.78
    )

    if briefing["success"]:
        print(f"\n{briefing['briefing_text']}")
    else:
        print(f"Error: {briefing.get('error')}")

    # ─────────────────────────────────────────
    # SUMMARY
    # ─────────────────────────────────────────
    print()
    garis("*")
    print("  DEMO SELESAI — Semua modul AI Engine berjalan!")
    print()
    print("  Modul yang aktif:")
    print("  ✅ Smart Task Input (NLP Parser)")
    print("  ✅ AI Task Prioritization")
    print("  ✅ Intelligent Time Blocking")
    print("  ✅ Energy Pattern Learning")
    print("  ✅ Realistic Duration Prediction")
    print("  ✅ Procrastination Detection")
    print("  ✅ Habit Correlation Analysis")
    print("  ✅ Weekly Analytics")
    print("  ✅ Daily Briefing Generator")
    garis("*")
    print()


if __name__ == "__main__":
    main()
