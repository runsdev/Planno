# File: ai_engine/nlp/onboarding_parser.py
# Modul: Onboarding Preferences Parser
# Deskripsi: Memproses jawaban onboarding user menjadi konfigurasi AI personal
# Input: dict jawaban onboarding dari frontend
# Output: dict konfigurasi yang siap dipakai EnergyLearner dan TimeBlocker

class OnboardingParser:
    """
    Memproses jawaban 5 pertanyaan onboarding user menjadi konfigurasi AI.

    Cara pakai:
        parser = OnboardingParser()
        config = parser.parse({
            "focusTime": "7-10 pagi",
            "workStyle": "Deep focus",
            "workHours": {"start": "08:00", "end": "17:00"},
            "focusDuration": "60",
            "taskType": "early"
        })
    """

    # Mapping jam produktif dari pilihan onboarding ke pattern energi
    FOCUS_TIME_TO_PATTERN = {
        "7-10 pagi": {
            "06": 3, "07": 4, "08": 5, "09": 5, "10": 5,
            "11": 4, "12": 3, "13": 2, "14": 2,
            "15": 3, "16": 3, "17": 3, "18": 2, "19": 2, "20": 2
        },
        "10-14 siang": {
            "06": 2, "07": 2, "08": 3, "09": 3, "10": 5,
            "11": 5, "12": 5, "13": 4, "14": 4,
            "15": 3, "16": 3, "17": 2, "18": 2, "19": 2, "20": 2
        },
        "14-18 siang": {
            "06": 2, "07": 2, "08": 2, "09": 3, "10": 3,
            "11": 3, "12": 3, "13": 3, "14": 5,
            "15": 5, "16": 5, "17": 4, "18": 3, "19": 2, "20": 2
        },
        "18-22 malam": {
            "06": 2, "07": 2, "08": 2, "09": 2, "10": 3,
            "11": 3, "12": 3, "13": 3, "14": 3,
            "15": 3, "16": 3, "17": 4, "18": 5, "19": 5, "20": 5
        }
    }

    # Mapping durasi fokus dari pilihan onboarding ke menit
    FOCUS_DURATION_MAP = {
        "30": 30,
        "60": 60,
        "120": 120
    }

    # Mapping work style ke durasi kerja sebelum break
    WORK_STYLE_TO_BREAK_INTERVAL = {
        "Deep focus": 90,
        "Multitasking": 45,
        "Bergantian": 60
    }

    # Mapping task type ke threshold prokrastinasi
    TASK_TYPE_TO_PROCRAS_THRESHOLD = {
        "last-minute": 4,   # user biasa kerja mepet → threshold lebih toleran
        "early": 2          # user biasa cicil → cepat deteksi kalau telat mulai
    }

    def parse(self, preferences: dict) -> dict:
        """
        Proses jawaban onboarding menjadi konfigurasi AI.

        Args:
            preferences (dict): {
                focusTime (str): "7-10 pagi" / "10-14 siang" / "14-18 siang" / "18-22 malam"
                workStyle (str): "Deep focus" / "Multitasking" / "Bergantian"
                workHours (dict): {"start": "HH:MM", "end": "HH:MM"}
                focusDuration (str): "30" / "60" / "120"
                taskType (str): "last-minute" / "early"
            }

        Returns:
            dict: {
                energy_pattern (dict): pattern energi per jam untuk EnergyLearner,
                work_start (str): jam mulai kerja HH:MM,
                work_end (str): jam selesai kerja HH:MM,
                focus_duration_minutes (int): durasi sesi fokus,
                break_interval_minutes (int): menit kerja sebelum break,
                procrastination_threshold (int): threshold deteksi prokrastinasi,
                work_style (str): gaya kerja user,
                task_type (str): tipe user (last-minute / early),
                briefing_tone (str): tone briefing untuk daily_briefing
            }
        """
        focus_time  = preferences.get("focusTime", "7-10 pagi")
        work_style  = preferences.get("workStyle", "Deep focus")
        work_hours  = preferences.get("workHours", {"start": "08:00", "end": "17:00"})
        focus_dur   = preferences.get("focusDuration", "60")
        task_type   = preferences.get("taskType", "early")

        energy_pattern = self.FOCUS_TIME_TO_PATTERN.get(
            focus_time,
            self.FOCUS_TIME_TO_PATTERN["7-10 pagi"]
        )

        focus_duration = self.FOCUS_DURATION_MAP.get(focus_dur, 60)
        break_interval = self.WORK_STYLE_TO_BREAK_INTERVAL.get(work_style, 60)
        procras_threshold = self.TASK_TYPE_TO_PROCRAS_THRESHOLD.get(task_type, 3)

        work_start = work_hours.get("start", "08:00") or "08:00"
        work_end   = work_hours.get("end", "17:00") or "17:00"

        # Tentukan tone briefing berdasarkan gaya kerja
        if work_style == "Deep focus":
            briefing_tone = "fokus dan tegas"
        elif work_style == "Multitasking":
            briefing_tone = "ringkas dan energik"
        else:
            briefing_tone = "santai dan terstruktur"

        return {
            "energy_pattern": energy_pattern,
            "work_start": work_start,
            "work_end": work_end,
            "focus_duration_minutes": focus_duration,
            "break_interval_minutes": break_interval,
            "procrastination_threshold": procras_threshold,
            "work_style": work_style,
            "task_type": task_type,
            "briefing_tone": briefing_tone
        }

    def get_peak_hours_from_config(self, config: dict) -> list:
        """
        Ambil top 3 jam produktif dari konfigurasi onboarding.

        Args:
            config (dict): hasil dari parse()

        Returns:
            list: ["09:00", "10:00", "08:00"]
        """
        pattern = config.get("energy_pattern", {})
        sorted_hours = sorted(pattern.items(), key=lambda x: x[1], reverse=True)
        return [f"{jam}:00" for jam, _ in sorted_hours[:3]]
