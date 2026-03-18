from datetime import datetime, timedelta


class WeeklyAnalytics:
    """
    Modul untuk menghitung metrik produktivitas mingguan user.
    Menghasilkan semua data yang ditampilkan di halaman Analytics Planno.

    Cara pakai:
        analytics = WeeklyAnalytics()
        analytics.record_task(user_id, task_data)
        metrics = analytics.get_weekly_metrics(user_id)
        print(metrics)
    """

    def __init__(self):
        self._tasks = {}
        self._focus_sessions = {}

    def record_task(self, user_id: str, task_data: dict) -> dict:
        """
        Catat data task yang sudah selesai.

        Args:
            user_id (str): ID user
            task_data (dict):
                - task_id (str)
                - title (str)
                - category (str)
                - status (str): done/pending/cancelled
                - estimasi_menit (int)
                - aktual_menit (int | None)
                - tanggal (str): YYYY-MM-DD

        Returns:
            dict: {success, message}
        """

        if not task_data.get("task_id"):
            return {
                "success": False,
                "message": "task_id tidak boleh kosong"
            }

        if user_id not in self._tasks:
            self._tasks[user_id] = []

        self._tasks[user_id].append(task_data)

        return {
            "success": True,
            "message": f"Task '{task_data.get('title')}' berhasil dicatat"
        }

    def record_focus_session(
        self,
        user_id: str,
        durasi_menit: int,
        tanggal: str
    ) -> dict:
        """
        Catat sesi fokus Pomodoro.

        Args:
            user_id (str): ID user
            durasi_menit (int): Durasi sesi fokus dalam menit
            tanggal (str): Tanggal format YYYY-MM-DD

        Returns:
            dict: {success, message}
        """

        if durasi_menit <= 0:
            return {
                "success": False,
                "message": "Durasi sesi harus lebih dari 0 menit"
            }

        if user_id not in self._focus_sessions:
            self._focus_sessions[user_id] = []

        self._focus_sessions[user_id].append({
            "durasi_menit": durasi_menit,
            "tanggal": tanggal
        })

        return {
            "success": True,
            "message": f"Sesi fokus {durasi_menit} menit berhasil dicatat"
        }

    def get_weekly_metrics(
        self,
        user_id: str,
        minggu: str = None
    ) -> dict:
        """
        Hitung semua metrik produktivitas untuk minggu tertentu.

        Args:
            user_id (str): ID user
            minggu (str | None): Tanggal awal minggu YYYY-MM-DD,
                                 default minggu ini

        Returns:
            dict: {
                week_start (str),
                week_end (str),
                completion_rate (float),
                total_tasks (int),
                tasks_done (int),
                avg_focus_jam (float),
                duration_accuracy (float),
                distribusi_kategori (dict),
                daily_completion (dict),
                perbandingan_minggu_lalu (dict)
            }
        """

        if minggu is None:
            today = datetime.now()
            week_start = today - timedelta(days=today.weekday())
        else:
            week_start = datetime.strptime(minggu, "%Y-%m-%d")

        week_end = week_start + timedelta(days=6)
        week_start_str = week_start.strftime("%Y-%m-%d")
        week_end_str = week_end.strftime("%Y-%m-%d")

        tasks = self._tasks.get(user_id, [])
        sessions = self._focus_sessions.get(user_id, [])

        tasks_minggu_ini = [
            t for t in tasks
            if week_start_str <= t.get("tanggal", "") <= week_end_str
        ]

        sessions_minggu_ini = [
            s for s in sessions
            if week_start_str <= s.get("tanggal", "") <= week_end_str
        ]

        completion_rate = self._hitung_completion_rate(tasks_minggu_ini)
        avg_focus = self._hitung_avg_focus(sessions_minggu_ini)
        duration_accuracy = self._hitung_duration_accuracy(tasks_minggu_ini)
        distribusi = self._hitung_distribusi_kategori(tasks_minggu_ini)
        daily = self._hitung_daily_completion(tasks_minggu_ini, week_start)

        prev_week_start = week_start - timedelta(days=7)
        prev_week_start_str = prev_week_start.strftime("%Y-%m-%d")
        prev_week_end_str = (prev_week_start + timedelta(days=6)).strftime("%Y-%m-%d")

        tasks_minggu_lalu = [
            t for t in tasks
            if prev_week_start_str <= t.get("tanggal", "") <= prev_week_end_str
        ]

        prev_completion = self._hitung_completion_rate(tasks_minggu_lalu)
        perubahan = round(
            (completion_rate - prev_completion) * 100, 1
        ) if prev_completion is not None else None

        return {
            "week_start": week_start_str,
            "week_end": week_end_str,
            "completion_rate": completion_rate,
            "total_tasks": len(tasks_minggu_ini),
            "tasks_done": len([t for t in tasks_minggu_ini if t.get("status") == "done"]),
            "avg_focus_jam": avg_focus,
            "duration_accuracy": duration_accuracy,
            "distribusi_kategori": distribusi,
            "daily_completion": daily,
            "perbandingan_minggu_lalu": {
                "completion_rate_lalu": prev_completion,
                "perubahan_persen": perubahan
            }
        }

    def _hitung_completion_rate(self, tasks: list) -> float:
        """Hitung persentase task selesai."""
        if not tasks:
            return 0.0
        done = len([t for t in tasks if t.get("status") == "done"])
        return round(done / len(tasks), 2)

    def _hitung_avg_focus(self, sessions: list) -> float:
        """Hitung rata-rata jam fokus per hari."""
        if not sessions:
            return 0.0
        total_menit = sum(s["durasi_menit"] for s in sessions)
        hari_unik = len(set(s["tanggal"] for s in sessions))
        if hari_unik == 0:
            return 0.0
        return round(total_menit / hari_unik / 60, 1)

    def _hitung_duration_accuracy(self, tasks: list) -> float:
        """Hitung akurasi estimasi durasi vs aktual."""
        tasks_dengan_aktual = [
            t for t in tasks
            if t.get("estimasi_menit") and t.get("aktual_menit")
        ]
        if not tasks_dengan_aktual:
            return None

        total_error = sum(
            abs(t["aktual_menit"] - t["estimasi_menit"]) / t["estimasi_menit"]
            for t in tasks_dengan_aktual
        )
        avg_error = total_error / len(tasks_dengan_aktual)
        return round(max(0, 1 - avg_error), 2)

    def _hitung_distribusi_kategori(self, tasks: list) -> dict:
        """Hitung distribusi waktu per kategori."""
        distribusi = {}
        for task in tasks:
            cat = task.get("category", "other")
            menit = task.get("aktual_menit") or task.get("estimasi_menit") or 0
            distribusi[cat] = distribusi.get(cat, 0) + menit

        total = sum(distribusi.values())
        if total == 0:
            return {}

        return {
            cat: {
                "total_menit": menit,
                "persen": round(menit / total * 100, 1)
            }
            for cat, menit in distribusi.items()
        }

    def _hitung_daily_completion(
        self,
        tasks: list,
        week_start: datetime
    ) -> dict:
        """Hitung completion rate per hari dalam seminggu."""
        daily = {}
        for i in range(7):
            tanggal = (week_start + timedelta(days=i)).strftime("%Y-%m-%d")
            tasks_hari = [t for t in tasks if t.get("tanggal") == tanggal]
            if tasks_hari:
                done = len([t for t in tasks_hari if t.get("status") == "done"])
                daily[tanggal] = {
                    "total": len(tasks_hari),
                    "done": done,
                    "rate": round(done / len(tasks_hari), 2)
                }
            else:
                daily[tanggal] = {"total": 0, "done": 0, "rate": 0.0}
        return daily