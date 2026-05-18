from datetime import datetime


class PriorityScorer:
    """
    Modul untuk menghitung priority score dan klasifikasi kuadran.
    Menggunakan rule-based logic — tidak butuh data training.

    Urutan prioritas:
    - Kategori  : Akademik > Kerja > Personal > Lainnya
    - Type      : Tugas > Acara
    - Deadline  : makin dekat makin tinggi urgency

    Cara pakai:
        scorer = PriorityScorer()
        hasil = scorer.score_task({
            "deadline": "2026-03-17 14:00",
            "importance": "high",
            "duration_minutes": 120,
            "reschedule_count": 0,
            "category": "Akademik",
            "type": "Tugas"
        })
    """

    # Bobot importance berdasarkan kategori (Akademik > Kerja > Personal > Lainnya)
    CATEGORY_IMPORTANCE: dict[str, float] = {
        "Akademik": 100,
        "academic": 100,
        "Kerja":    80,
        "work":     80,
        "Personal": 55,
        "personal": 55,
        "health":   55,
        "Lainnya":  30,
    }

    # Bobot tambahan berdasarkan type (Tugas > Acara)
    TYPE_BONUS: dict[str, float] = {
        "Tugas": 10,
        "Acara": 0,
    }

    # Mapping importance string ke score (fallback jika category tidak ada)
    IMPORTANCE_MAP: dict[str, float] = {
        "high":   100,
        "medium":  60,
        "low":     30,
    }

    def score_task(self, task_data: dict) -> dict:
        """
        Hitung priority score dan klasifikasi kuadran.

        Args:
            task_data (dict): {
                deadline (str | None)     : format YYYY-MM-DD HH:MM
                importance (str)          : high/medium/low
                duration_minutes (int)    : estimasi durasi
                reschedule_count (int)    : berapa kali sudah ditunda
                category (str | None)     : Akademik/Kerja/Personal/Lainnya
                type (str | None)         : Tugas/Acara
            }

        Returns:
            dict: {
                priority_score (int) : 0-100,
                quadrant (str)       : DO_FIRST/SCHEDULE/DELEGATE/ELIMINATE,
                priority_label (str) : Tinggi/Sedang/Rendah,
                urgency (str)        : high/medium/low,
                importance (str)     : high/medium/low
            }
        """
        urgency_score    = self._hitung_urgency(
            task_data.get("deadline"),
            task_data.get("reschedule_count", 0) or 0
        )
        importance_score = self._hitung_importance(task_data)
        type_bonus       = self.TYPE_BONUS.get(task_data.get("type", "Tugas"), 0)

        raw_score      = urgency_score * 0.6 + importance_score * 0.4 + type_bonus
        priority_score = min(round(raw_score), 100)

        urgency_label    = self._label_urgency(urgency_score)
        importance_label = task_data.get("importance", "medium")
        quadrant         = self._klasifikasi_kuadran(urgency_score, importance_score)
        priority_label   = self._label_priority(priority_score)

        return {
            "priority_score" : priority_score,
            "quadrant"       : quadrant,
            "priority_label" : priority_label,
            "urgency"        : urgency_label,
            "importance"     : importance_label,
        }

    def _hitung_importance(self, task_data: dict) -> float:
        """
        Hitung importance score berdasarkan kategori (utama) atau
        importance string (fallback).
        Urutan: Akademik > Kerja > Personal > Lainnya
        """
        category = task_data.get("category")
        if category and category in self.CATEGORY_IMPORTANCE:
            return self.CATEGORY_IMPORTANCE[category]
        importance = task_data.get("importance", "medium")
        return self.IMPORTANCE_MAP.get(importance, 60)

    def _hitung_urgency(self, deadline: str, reschedule_count: int) -> float:
        """Hitung urgency score 0-100 berdasarkan jarak deadline."""
        if deadline is None:
            base_urgency = 30
        else:
            try:
                if len(deadline) == 10:
                    deadline_dt = datetime.strptime(deadline, "%Y-%m-%d")
                else:
                    deadline_dt = datetime.strptime(deadline, "%Y-%m-%d %H:%M")

                hari_lagi = (deadline_dt - datetime.now()).days

                if hari_lagi < 0:
                    base_urgency = 100
                elif hari_lagi == 0:
                    base_urgency = 95
                elif hari_lagi == 1:
                    base_urgency = 85
                elif hari_lagi <= 3:
                    base_urgency = 70
                elif hari_lagi <= 7:
                    base_urgency = 50
                elif hari_lagi <= 14:
                    base_urgency = 35
                else:
                    base_urgency = 20

            except ValueError:
                base_urgency = 30

        bonus_reschedule = min((reschedule_count or 0) * 10, 30)
        return min(base_urgency + bonus_reschedule, 100)

    def _label_urgency(self, urgency_score: float) -> str:
        if urgency_score >= 70: return "high"
        elif urgency_score >= 40: return "medium"
        else: return "low"

    def _label_priority(self, score: int) -> str:
        """Konversi priority_score ke label Tinggi/Sedang/Rendah."""
        if score >= 70: return "Tinggi"
        elif score >= 40: return "Sedang"
        else: return "Rendah"

    def _klasifikasi_kuadran(self, urgency: float, importance: float) -> str:
        """Klasifikasi ke 4 kuadran Eisenhower."""
        urgent    = urgency >= 70
        important = importance >= 70

        if urgent and important:     return "DO_FIRST"
        elif not urgent and important: return "SCHEDULE"
        elif urgent and not important: return "DELEGATE"
        else:                          return "ELIMINATE"
