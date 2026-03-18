# File: ai_engine/energy/energy_learner.py
# Modul: Energy Pattern Learning
# Deskripsi: Mempelajari pola energi user untuk optimasi jadwal
# Menggunakan: pandas + scikit-learn (fase awal: statistik sederhana)
# Input: histori energy log user
# Output: dict jam produktif dan jam energi rendah
# Status: TODO - akan diimplementasi minggu 3-4

from datetime import datetime
import statistics


class EnergyLearner:
    """
    Modul untuk mempelajari pola energi user dan menentukan jam produktif.
    Fase 1: agregasi statistik sederhana dari histori energy log.
    Fase 2: weighted average antara data user dan default template.

    Cara pakai:
        learner = EnergyLearner()
        learner.log_energy(user_id, "09:00", 5)
        peak = learner.get_peak_hours(user_id)
        print(peak)
    """

    DEFAULT_ENERGY_PATTERN = {
        "06": 2, "07": 3, "08": 4,
        "09": 5, "10": 5, "11": 4,
        "12": 3, "13": 2, "14": 2,
        "15": 3, "16": 4, "17": 4,
        "18": 3, "19": 2, "20": 2
    }

    MIN_HARI_UNTUK_BELAJAR = 7
    MIN_HARI_FULL_PERSONALIZED = 30

    def __init__(self):
        self._energy_logs = {}

    def log_energy(self, user_id: str, time_slot: str, energy_level: int) -> dict:
        """
        Catat energy level user pada jam tertentu.

        Args:
            user_id (str): ID user
            time_slot (str): Jam pencatatan format HH:MM
            energy_level (int): Level energi 1-5

        Returns:
            dict: {success, message}
        """

        if energy_level < 1 or energy_level > 5:
            return {
                "success": False,
                "message": "Energy level harus antara 1-5"
            }

        if user_id not in self._energy_logs:
            self._energy_logs[user_id] = []

        jam = time_slot.split(":")[0]
        tanggal = datetime.now().strftime("%Y-%m-%d")

        self._energy_logs[user_id].append({
            "tanggal": tanggal,
            "jam": jam,
            "energy_level": energy_level
        })

        return {
            "success": True,
            "message": f"Energy level {energy_level} berhasil dicatat untuk jam {time_slot}"
        }

    def get_peak_hours(self, user_id: str) -> dict:
        """
        Dapatkan jam-jam produktif user berdasarkan histori energy log.

        Args:
            user_id (str): ID user

        Returns:
            dict: {
                peak_hours (list): jam dengan energi tertinggi,
                low_hours (list): jam dengan energi terendah,
                pattern (dict): rata-rata energi per jam,
                confidence (str): low/medium/high,
                data_points (int): jumlah data yang digunakan
            }
        """

        logs = self._energy_logs.get(user_id, [])
        jumlah_hari = len(set(log["tanggal"] for log in logs))

        if jumlah_hari < self.MIN_HARI_UNTUK_BELAJAR:
            return self._get_default_pattern(jumlah_hari)

        pattern_user = self._hitung_rata_rata_per_jam(logs)
        bobot_user = min(0.9, jumlah_hari / self.MIN_HARI_FULL_PERSONALIZED)
        bobot_default = 1 - bobot_user

        pattern_final = {}
        for jam in self.DEFAULT_ENERGY_PATTERN:
            user_val = pattern_user.get(jam, self.DEFAULT_ENERGY_PATTERN[jam])
            default_val = self.DEFAULT_ENERGY_PATTERN[jam]
            pattern_final[jam] = round(
                user_val * bobot_user + default_val * bobot_default, 2
            )

        if jumlah_hari >= self.MIN_HARI_FULL_PERSONALIZED:
            confidence = "high"
        elif jumlah_hari >= 14:
            confidence = "medium"
        else:
            confidence = "low"

        peak_hours = self._get_peak_hours_from_pattern(pattern_final, top_n=3)
        low_hours = self._get_low_hours_from_pattern(pattern_final, bottom_n=3)

        return {
            "peak_hours": peak_hours,
            "low_hours": low_hours,
            "pattern": pattern_final,
            "confidence": confidence,
            "data_points": len(logs)
        }

    def get_energy_for_slot(self, user_id: str, time_slot: str) -> dict:
        """
        Dapatkan prediksi level energi untuk slot waktu tertentu.

        Args:
            user_id (str): ID user
            time_slot (str): Jam format HH:MM

        Returns:
            dict: {
                jam (str),
                energy_level (float): 1-5,
                label (str): tinggi/sedang/rendah
            }
        """

        pattern_data = self.get_peak_hours(user_id)
        pattern = pattern_data.get("pattern", self.DEFAULT_ENERGY_PATTERN)
        jam = time_slot.split(":")[0]
        energy = pattern.get(jam, 3)

        if energy >= 4:
            label = "tinggi"
        elif energy >= 3:
            label = "sedang"
        else:
            label = "rendah"

        return {
            "jam": jam,
            "energy_level": energy,
            "label": label
        }

    def _get_default_pattern(self, jumlah_hari: int) -> dict:
        """Return default pattern untuk user baru."""
        peak_hours = self._get_peak_hours_from_pattern(
            self.DEFAULT_ENERGY_PATTERN, top_n=3
        )
        low_hours = self._get_low_hours_from_pattern(
            self.DEFAULT_ENERGY_PATTERN, bottom_n=3
        )
        return {
            "peak_hours": peak_hours,
            "low_hours": low_hours,
            "pattern": self.DEFAULT_ENERGY_PATTERN,
            "confidence": "low",
            "data_points": jumlah_hari
        }

    def _hitung_rata_rata_per_jam(self, logs: list) -> dict:
        """Hitung rata-rata energy level per jam dari logs."""
        per_jam = {}
        for log in logs:
            jam = log["jam"]
            if jam not in per_jam:
                per_jam[jam] = []
            per_jam[jam].append(log["energy_level"])

        return {
            jam: round(statistics.mean(values), 2)
            for jam, values in per_jam.items()
        }

    def _get_peak_hours_from_pattern(self, pattern: dict, top_n: int = 3) -> list:
        """Ambil jam dengan energi tertinggi."""
        sorted_hours = sorted(
            pattern.items(),
            key=lambda x: x[1],
            reverse=True
        )
        return [f"{jam}:00" for jam, _ in sorted_hours[:top_n]]

    def _get_low_hours_from_pattern(self, pattern: dict, bottom_n: int = 3) -> list:
        """Ambil jam dengan energi terendah."""
        sorted_hours = sorted(
            pattern.items(),
            key=lambda x: x[1]
        )
        return [f"{jam}:00" for jam, _ in sorted_hours[:bottom_n]]
