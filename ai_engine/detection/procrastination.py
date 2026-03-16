from datetime import datetime


class ProcrastinationDetector:
    """
    Modul untuk mendeteksi pola penundaan task.
    Menggunakan rule-based logic — tidak butuh data training.

    Cara pakai:
        detector = ProcrastinationDetector()
        hasil = detector.detect({
            "title": "Laporan Riset",
            "deadline": "2026-03-17 14:00",
            "reschedule_count": 3,
            "last_updated": "2026-03-10"
        })
        print(hasil)
    """

    BATAS_RESCHEDULE = 3
    BATAS_TIDAK_DISENTUH = 5

    def detect(self, task_data: dict) -> dict:
        """
        Deteksi apakah task menunjukkan pola prokrastinasi.

        Args:
            task_data (dict): Data task dengan field:
                - title (str): judul task
                - deadline (str | None): format YYYY-MM-DD HH:MM
                - reschedule_count (int): berapa kali ditunda
                - last_updated (str | None): terakhir disentuh YYYY-MM-DD

        Returns:
            dict: {
                is_procrastinating (bool),
                level (str): none/mild/severe,
                reason (str | None),
                recommendation (str | None)
            }
        """

        reschedule_count = task_data.get("reschedule_count", 0)
        deadline = task_data.get("deadline")
        last_updated = task_data.get("last_updated")
        title = task_data.get("title", "Task ini")

        # Cek kondisi 1: sudah ditunda terlalu banyak
        if reschedule_count >= self.BATAS_RESCHEDULE:
            return {
                "is_procrastinating": True,
                "level": "severe",
                "reason": f"{title} sudah ditunda {reschedule_count} kali",
                "recommendation": f"Pecah '{title}' menjadi tugas lebih kecil yang bisa diselesaikan dalam 30 menit"
            }

        # Cek kondisi 2: deadline sudah terlewat
        if deadline is not None:
            try:
                if len(deadline) == 10:
                    deadline_dt = datetime.strptime(deadline, "%Y-%m-%d")
                else:
                    deadline_dt = datetime.strptime(deadline, "%Y-%m-%d %H:%M")

                if deadline_dt < datetime.now():
                    return {
                        "is_procrastinating": True,
                        "level": "severe",
                        "reason": f"{title} sudah melewati deadline",
                        "recommendation": f"Selesaikan '{title}' sekarang dan komunikasikan keterlambatan jika perlu"
                    }

                # Cek kondisi 3: tidak disentuh padahal deadline dekat
                hari_lagi = (deadline_dt - datetime.now()).days
                if last_updated is not None and hari_lagi <= 3:
                    last_dt = datetime.strptime(last_updated, "%Y-%m-%d")
                    hari_tidak_disentuh = (datetime.now() - last_dt).days
                    if hari_tidak_disentuh >= self.BATAS_TIDAK_DISENTUH:
                        return {
                            "is_procrastinating": True,
                            "level": "mild",
                            "reason": f"{title} tidak disentuh {hari_tidak_disentuh} hari padahal deadline {hari_lagi} hari lagi",
                            "recommendation": f"Mulai kerjakan '{title}' hari ini minimal 30 menit"
                        }

            except ValueError:
                pass

        # Cek kondisi 4: reschedule 1-2 kali (peringatan awal)
        if reschedule_count > 0:
            return {
                "is_procrastinating": False,
                "level": "mild",
                "reason": f"{title} sudah ditunda {reschedule_count} kali",
                "recommendation": f"Perhatikan '{title}' agar tidak terus ditunda"
            }

        return {
            "is_procrastinating": False,
            "level": "none",
            "reason": None,
            "recommendation": None
        }

    def get_procrastinating_tasks(self, tasks: list) -> list:
        """
        Filter tasks yang menunjukkan pola prokrastinasi dari list tasks.

        Args:
            tasks (list): List task data

        Returns:
            list: Hanya tasks yang is_procrastinating == True
        """
        hasil = []
        for task in tasks:
            deteksi = self.detect(task)
            if deteksi["is_procrastinating"]:
                hasil.append({
                    **task,
                    "procrastination": deteksi
                })
        return hasil