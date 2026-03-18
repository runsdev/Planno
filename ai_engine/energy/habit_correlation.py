from datetime import datetime


class HabitCorrelationAnalyzer:
    """
    Modul untuk menganalisis korelasi antara kebiasaan harian user
    dengan tingkat produktivitas mereka.
    Menggunakan statistik sederhana dengan pandas-style calculation.

    Cara pakai:
        analyzer = HabitCorrelationAnalyzer()
        analyzer.record_day(
            user_id="user_001",
            tanggal="2026-03-16",
            habits={"tidur_jam": 8, "olahraga": True, "meditasi": True},
            completion_rate=0.85
        )
        insight = analyzer.get_insights("user_001")
        print(insight)
    """

    MIN_DATA_UNTUK_ANALISIS = 7

    def __init__(self):
        self._data = {}

    def record_day(
        self,
        user_id: str,
        tanggal: str,
        habits: dict,
        completion_rate: float
    ) -> dict:
        """
        Catat data habit dan produktivitas untuk satu hari.

        Args:
            user_id (str): ID user
            tanggal (str): Tanggal format YYYY-MM-DD
            habits (dict): Data habit hari ini, contoh:
                {
                    "tidur_jam": 7.5,
                    "olahraga": True,
                    "meditasi": True,
                    "screen_time_jam": 3
                }
            completion_rate (float): Tingkat penyelesaian task 0.0-1.0

        Returns:
            dict: {success, message}
        """

        if completion_rate < 0 or completion_rate > 1:
            return {
                "success": False,
                "message": "Completion rate harus antara 0.0 dan 1.0"
            }

        if user_id not in self._data:
            self._data[user_id] = []

        self._data[user_id].append({
            "tanggal": tanggal,
            "habits": habits,
            "completion_rate": completion_rate
        })

        return {
            "success": True,
            "message": f"Data hari {tanggal} berhasil dicatat"
        }

    def get_insights(self, user_id: str) -> dict:
        """
        Analisis korelasi habit dengan produktivitas dan generate insight.

        Args:
            user_id (str): ID user

        Returns:
            dict: {
                success (bool),
                insights (list): list insight teks,
                correlations (dict): korelasi per habit,
                data_points (int),
                confidence (str)
            }
        """

        data = self._data.get(user_id, [])

        if len(data) < self.MIN_DATA_UNTUK_ANALISIS:
            return {
                "success": False,
                "insights": [],
                "correlations": {},
                "data_points": len(data),
                "confidence": "low",
                "message": f"Butuh minimal {self.MIN_DATA_UNTUK_ANALISIS} hari data. Saat ini: {len(data)} hari"
            }

        correlations = self._hitung_korelasi(data)
        insights = self._generate_insights(correlations)

        if len(data) >= 30:
            confidence = "high"
        elif len(data) >= 14:
            confidence = "medium"
        else:
            confidence = "low"

        return {
            "success": True,
            "insights": insights,
            "correlations": correlations,
            "data_points": len(data),
            "confidence": confidence
        }

    def get_best_habit(self, user_id: str) -> dict:
        """
        Temukan habit yang paling berkorelasi positif dengan produktivitas.

        Args:
            user_id (str): ID user

        Returns:
            dict: {habit_name, correlation, insight_text}
        """

        data = self._data.get(user_id, [])
        if len(data) < self.MIN_DATA_UNTUK_ANALISIS:
            return {
                "habit_name": None,
                "correlation": None,
                "insight_text": "Belum cukup data untuk analisis"
            }

        correlations = self._hitung_korelasi(data)
        if not correlations:
            return {
                "habit_name": None,
                "correlation": None,
                "insight_text": "Tidak ada habit yang tercatat"
            }

        best_habit = max(correlations, key=lambda x: correlations[x])
        best_corr = correlations[best_habit]

        pct = round(abs(best_corr) * 35)
        insight = f"{best_habit.replace('_', ' ').title()} meningkatkan produktivitasmu {pct}%"

        return {
            "habit_name": best_habit,
            "correlation": round(best_corr, 2),
            "insight_text": insight
        }

    def _hitung_korelasi(self, data: list) -> dict:
        """
        Hitung korelasi sederhana antara setiap habit dengan completion rate.
        Menggunakan Pearson correlation coefficient yang disederhanakan.
        """

        if not data:
            return {}

        semua_habit_keys = set()
        for d in data:
            semua_habit_keys.update(d["habits"].keys())

        correlations = {}

        for habit_key in semua_habit_keys:
            habit_values = []
            completion_values = []

            for d in data:
                habit_val = d["habits"].get(habit_key)
                if habit_val is None:
                    continue

                if isinstance(habit_val, bool):
                    habit_val = 1.0 if habit_val else 0.0

                habit_values.append(float(habit_val))
                completion_values.append(d["completion_rate"])

            if len(habit_values) < 3:
                continue

            corr = self._pearson_correlation(habit_values, completion_values)
            if corr is not None:
                correlations[habit_key] = corr

        return correlations

    def _pearson_correlation(self, x: list, y: list) -> float:
        """Hitung Pearson correlation coefficient."""
        n = len(x)
        if n < 2:
            return None

        mean_x = sum(x) / n
        mean_y = sum(y) / n

        numerator = sum(
            (x[i] - mean_x) * (y[i] - mean_y)
            for i in range(n)
        )

        sum_sq_x = sum((xi - mean_x) ** 2 for xi in x)
        sum_sq_y = sum((yi - mean_y) ** 2 for yi in y)

        denominator = (sum_sq_x * sum_sq_y) ** 0.5

        if denominator == 0:
            return 0.0

        return numerator / denominator

    def _generate_insights(self, correlations: dict) -> list:
        """Generate kalimat insight dari hasil korelasi."""
        insights = []

        for habit, corr in correlations.items():
            habit_label = habit.replace("_", " ").title()
            pct = round(abs(corr) * 35)

            if corr >= 0.5:
                insights.append(
                    f"{habit_label} meningkatkan produktivitasmu {pct}%"
                )
            elif corr >= 0.3:
                insights.append(
                    f"{habit_label} sedikit meningkatkan produktivitasmu"
                )
            elif corr <= -0.5:
                insights.append(
                    f"{habit_label} berlebihan menurunkan produktivitasmu {pct}%"
                )
            elif corr <= -0.3:
                insights.append(
                    f"{habit_label} berlebihan sedikit menurunkan produktivitasmu"
                )

        return insights