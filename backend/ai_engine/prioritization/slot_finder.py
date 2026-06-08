from datetime import datetime, timedelta


class SlotFinder:
    """
    Cari slot kosong berikutnya jika ada konflik waktu.
    Frontend kirim daftar occupied slots, backend cari slot bebas.
    """

    def find_next_slot(
        self,
        proposed_start: str,        # "YYYY-MM-DD HH:MM"
        duration_minutes: int,
        occupied_slots: list[dict], # [{"start": "YYYY-MM-DD HH:MM", "end": "YYYY-MM-DD HH:MM"}]
        work_start_hour: int = 7,
        work_end_hour: int = 22,
        step_minutes: int = 30,
        max_attempts: int = 48,     # max 24 jam ke depan dengan step 30 menit
    ) -> dict:
        """
        Returns:
            {
                "has_conflict": bool,
                "original_start": str,
                "suggested_start": str | None,
                "suggested_end": str | None,
            }
        """
        try:
            proposed_dt = datetime.strptime(proposed_start, "%Y-%m-%d %H:%M")
        except ValueError:
            return {
                "has_conflict": False,
                "original_start": proposed_start,
                "suggested_start": None,
                "suggested_end": None,
            }

        duration = duration_minutes or 60

        # Parse semua occupied slots
        parsed_slots = []
        for slot in occupied_slots:
            try:
                s = datetime.strptime(slot["start"], "%Y-%m-%d %H:%M")
                e = datetime.strptime(slot["end"],   "%Y-%m-%d %H:%M")
                parsed_slots.append((s, e))
            except (ValueError, KeyError):
                continue

        # Cek apakah proposed_start konflik
        proposed_end = proposed_dt + timedelta(minutes=duration)
        if not self._has_overlap(proposed_dt, proposed_end, parsed_slots):
            return {
                "has_conflict": False,
                "original_start": proposed_start,
                "suggested_start": None,
                "suggested_end": None,
            }

        # Ada konflik → cari slot kosong berikutnya
        candidate = proposed_dt + timedelta(minutes=step_minutes)
        for _ in range(max_attempts):
            # Pastikan dalam jam kerja
            if candidate.hour < work_start_hour:
                candidate = candidate.replace(hour=work_start_hour, minute=0)
            if candidate.hour >= work_end_hour:
                # Lanjut ke hari berikutnya jam work_start
                candidate = (candidate + timedelta(days=1)).replace(
                    hour=work_start_hour, minute=0
                )

            candidate_end = candidate + timedelta(minutes=duration)
            if not self._has_overlap(candidate, candidate_end, parsed_slots):
                return {
                    "has_conflict": True,
                    "original_start": proposed_start,
                    "suggested_start": candidate.strftime("%Y-%m-%d %H:%M"),
                    "suggested_end": candidate_end.strftime("%Y-%m-%d %H:%M"),
                }

            candidate += timedelta(minutes=step_minutes)

        # Tidak ketemu slot → return original saja
        return {
            "has_conflict": True,
            "original_start": proposed_start,
            "suggested_start": proposed_start,
            "suggested_end": None,
        }

    def _has_overlap(
        self,
        start: datetime,
        end: datetime,
        slots: list[tuple],
    ) -> bool:
        for s, e in slots:
            # Overlap jika start < e AND end > s
            if start < e and end > s:
                return True
        return False