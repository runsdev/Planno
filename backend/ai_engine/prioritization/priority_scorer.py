from datetime import datetime


class PriorityScorer:
    """
    Modul untuk menghitung priority score dan klasifikasi Eisenhower Matrix.
    Menggunakan rule-based logic — tidak butuh data training.

    Cara pakai:
        scorer = PriorityScorer()
        hasil = scorer.score_task({
            "deadline": "2026-03-17 14:00",
            "importance": "high",
            "duration_minutes": 120,
            "reschedule_count": 0
        })
        print(hasil)
    """

    def score_task(self, task_data: dict) -> dict:
        """
        Hitung priority score dan klasifikasi kuadran Eisenhower.

        Args:
            task_data (dict): Data task dengan field:
                - deadline (str | None): format YYYY-MM-DD HH:MM
                - importance (str): high/medium/low
                - duration_minutes (int | None)
                - reschedule_count (int): berapa kali sudah ditunda

        Returns:
            dict: {
                priority_score (int): 0-100,
                quadrant (str): DO_FIRST/SCHEDULE/DELEGATE/ELIMINATE,
                urgency (str): high/medium/low,
                importance (str): high/medium/low
            }
        """

        urgency_score = self._hitung_urgency(
            task_data.get("deadline"),
            task_data.get("reschedule_count", 0)
        )

        importance_score = self._hitung_importance(
            task_data.get("importance", "medium")
        )

        priority_score = round(urgency_score * 0.6 + importance_score * 0.4)

        urgency_label = self._label_urgency(urgency_score)
        importance_label = task_data.get("importance", "medium")
        quadrant = self._klasifikasi_kuadran(urgency_score, importance_score)

        return {
            "priority_score": priority_score,
            "quadrant": quadrant,
            "urgency": urgency_label,
            "importance": importance_label
        }

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

        bonus_reschedule = min(reschedule_count * 10, 30)
        return min(base_urgency + bonus_reschedule, 100)

    def _hitung_importance(self, importance: str) -> float:
        """Konversi label importance ke score 0-100."""
        mapping = {
            "high": 100,
            "medium": 60,
            "low": 30
        }
        return mapping.get(importance, 60)

    def _label_urgency(self, urgency_score: float) -> str:
        """Konversi urgency score ke label."""
        if urgency_score >= 70:
            return "high"
        elif urgency_score >= 40:
            return "medium"
        else:
            return "low"

    def _klasifikasi_kuadran(self, urgency: float, importance: float) -> str:
        """
        Klasifikasi ke 4 kuadran Eisenhower:
        - DO_FIRST   : urgent + important
        - SCHEDULE   : not urgent + important
        - DELEGATE   : urgent + not important
        - ELIMINATE  : not urgent + not important
        """
        urgent = urgency >= 70
        important = importance >= 70

        if urgent and important:
            return "DO_FIRST"
        elif not urgent and important:
            return "SCHEDULE"
        elif urgent and not important:
            return "DELEGATE"
        else:
            return "ELIMINATE"