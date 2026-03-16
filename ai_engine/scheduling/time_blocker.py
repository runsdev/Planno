# File: ai_engine/scheduling/time_blocker.py
# Modul: Intelligent Time Blocking
# Deskripsi: Menyusun jadwal harian otomatis berdasarkan prioritas dan energi
# Menggunakan: Rule-based algorithm
# Input: list tasks, energy pattern user
# Output: list time blocks untuk hari ini
# Status: TODO - akan diimplementasi minggu depan

from datetime import datetime, timedelta


class TimeBlocker:
    """
    Modul untuk menyusun jadwal harian otomatis berdasarkan prioritas.
    Menggunakan rule-based algorithm — tidak butuh data training.

    Cara pakai:
        blocker = TimeBlocker()
        jadwal = blocker.generate_schedule(tasks, "08:00", "17:00")
        print(jadwal)
    """

    DURASI_BREAK = 15
    DURASI_KERJA_SEBELUM_BREAK = 90
    DURASI_DEFAULT = 60

    def generate_schedule(
        self,
        tasks: list,
        work_start: str = "08:00",
        work_end: str = "17:00",
        tanggal: str = None
    ) -> dict:
        """
        Generate jadwal harian otomatis dari list tasks.

        Args:
            tasks (list): List task dengan field:
                - task_id (str)
                - title (str)
                - duration_minutes (int | None)
                - priority_score (int): 0-100
                - category (str)
            work_start (str): Jam mulai kerja, format HH:MM
            work_end (str): Jam selesai kerja, format HH:MM
            tanggal (str | None): Tanggal jadwal YYYY-MM-DD, default hari ini

        Returns:
            dict: {
                date (str),
                blocks (list): list time blocks,
                total_tasks (int),
                total_jam_kerja (float)
            }
        """

        if tanggal is None:
            tanggal = datetime.now().strftime("%Y-%m-%d")

        tasks_sorted = sorted(
            tasks,
            key=lambda x: x.get("priority_score", 0),
            reverse=True
        )

        start_dt = datetime.strptime(f"{tanggal} {work_start}", "%Y-%m-%d %H:%M")
        end_dt = datetime.strptime(f"{tanggal} {work_end}", "%Y-%m-%d %H:%M")

        blocks = []
        current_time = start_dt
        menit_sejak_break = 0
        task_count = 0

        for task in tasks_sorted:
            if current_time >= end_dt:
                break

            # Sisipkan break kalau sudah kerja 90 menit
            if menit_sejak_break >= self.DURASI_KERJA_SEBELUM_BREAK:
                break_end = current_time + timedelta(minutes=self.DURASI_BREAK)
                if break_end <= end_dt:
                    blocks.append({
                        "start": current_time.strftime("%H:%M"),
                        "end": break_end.strftime("%H:%M"),
                        "task_id": None,
                        "title": "Istirahat",
                        "block_type": "break",
                        "category": None,
                        "duration_minutes": self.DURASI_BREAK
                    })
                    current_time = break_end
                    menit_sejak_break = 0

            durasi = task.get("duration_minutes") or self.DURASI_DEFAULT
            task_end = current_time + timedelta(minutes=durasi)

            if task_end > end_dt:
                sisa_menit = int((end_dt - current_time).total_seconds() / 60)
                if sisa_menit < 15:
                    break
                task_end = end_dt
                durasi = sisa_menit

            blocks.append({
                "start": current_time.strftime("%H:%M"),
                "end": task_end.strftime("%H:%M"),
                "task_id": task.get("task_id"),
                "title": task.get("title"),
                "block_type": "focus",
                "category": task.get("category"),
                "duration_minutes": durasi,
                "priority_score": task.get("priority_score", 0)
            })

            current_time = task_end
            menit_sejak_break += durasi
            task_count += 1

        total_menit_kerja = sum(
            b["duration_minutes"] for b in blocks
            if b["block_type"] == "focus"
        )

        return {
            "date": tanggal,
            "blocks": blocks,
            "total_tasks": task_count,
            "total_jam_kerja": round(total_menit_kerja / 60, 1)
        }

    def smart_reschedule(self, schedule: dict, new_task: dict) -> dict:
        """
        Reschedule otomatis saat ada task baru atau konflik jadwal.

        Args:
            schedule (dict): Jadwal existing dari generate_schedule()
            new_task (dict): Task baru yang perlu disisipkan

        Returns:
            dict: {
                updated_schedule (dict),
                changes (list): deskripsi perubahan yang dilakukan
            }
        """

        changes = []
        blocks = schedule.get("blocks", [])
        tanggal = schedule.get("date", datetime.now().strftime("%Y-%m-%d"))

        durasi_new = new_task.get("duration_minutes") or self.DURASI_DEFAULT
        priority_new = new_task.get("priority_score", 0)

        # Cari slot kosong di antara blocks yang ada
        slot_ditemukan = False
        new_blocks = []

        for i, block in enumerate(blocks):
            if slot_ditemukan:
                new_blocks.append(block)
                continue

            # Cek apakah ada celah sebelum block ini
            if i == 0:
                prev_end = datetime.strptime(
                    f"{tanggal} 08:00", "%Y-%m-%d %H:%M"
                )
            else:
                prev_end = datetime.strptime(
                    f"{tanggal} {blocks[i-1]['end']}", "%Y-%m-%d %H:%M"
                )

            block_start = datetime.strptime(
                f"{tanggal} {block['start']}", "%Y-%m-%d %H:%M"
            )
            celah_menit = int((block_start - prev_end).total_seconds() / 60)

            if celah_menit >= durasi_new:
                task_end = prev_end + timedelta(minutes=durasi_new)
                new_blocks.append({
                    "start": prev_end.strftime("%H:%M"),
                    "end": task_end.strftime("%H:%M"),
                    "task_id": new_task.get("task_id"),
                    "title": new_task.get("title"),
                    "block_type": "focus",
                    "category": new_task.get("category"),
                    "duration_minutes": durasi_new,
                    "priority_score": priority_new
                })
                changes.append(
                    f"'{new_task.get('title')}' disisipkan di "
                    f"{prev_end.strftime('%H:%M')}–{task_end.strftime('%H:%M')}"
                )
                slot_ditemukan = True

            new_blocks.append(block)

        if not slot_ditemukan:
            last_end = blocks[-1]["end"] if blocks else "08:00"
            task_start = datetime.strptime(f"{tanggal} {last_end}", "%Y-%m-%d %H:%M")
            task_end = task_start + timedelta(minutes=durasi_new)
            new_blocks.append({
                "start": task_start.strftime("%H:%M"),
                "end": task_end.strftime("%H:%M"),
                "task_id": new_task.get("task_id"),
                "title": new_task.get("title"),
                "block_type": "focus",
                "category": new_task.get("category"),
                "duration_minutes": durasi_new,
                "priority_score": priority_new
            })
            changes.append(
                f"'{new_task.get('title')}' ditambahkan di akhir jadwal "
                f"{task_start.strftime('%H:%M')}–{task_end.strftime('%H:%M')}"
            )

        updated_schedule = {**schedule, "blocks": new_blocks}
        return {
            "updated_schedule": updated_schedule,
            "changes": changes
        }