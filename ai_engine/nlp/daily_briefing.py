import os
from groq import Groq
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()


class DailyBriefingGenerator:
    """
    Modul untuk generate teks daily briefing pagi yang personal.
    Menggabungkan output dari priority_scorer, energy_learner,
    procrastination, dan time_blocker menggunakan Groq API.

    Cara pakai:
        generator = DailyBriefingGenerator()
        briefing = generator.generate(
            user_name="Desi",
            top_tasks=[...],
            peak_hours=["09:00", "10:00"],
            procrastination_flags=[...],
            completion_rate=0.78
        )
        print(briefing)
    """

    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.1-8b-instant"

    def generate(
        self,
        user_name: str,
        top_tasks: list,
        peak_hours: list,
        procrastination_flags: list = None,
        completion_rate: float = None
    ) -> dict:
        """
        Generate teks daily briefing yang personal untuk user.

        Args:
            user_name (str): Nama user untuk sapaan personal
            top_tasks (list): List 3 task prioritas tertinggi hari ini
                Setiap task berisi: {title, deadline, priority_score, category}
            peak_hours (list): Jam produktif user dari energy_learner
            procrastination_flags (list): Task yang terdeteksi prokrastinasi
            completion_rate (float): Persentase task selesai minggu ini (0-1)

        Returns:
            dict: {
                success (bool),
                briefing_text (str),
                top_tasks (list),
                peak_hours (list),
                generated_at (str)
            }
        """

        if not top_tasks:
            return {
                "success": False,
                "briefing_text": None,
                "error": "Tidak ada task untuk dibriefing"
            }

        today = datetime.now()
        hari = ["Senin", "Selasa", "Rabu", "Kamis",
                "Jumat", "Sabtu", "Minggu"][today.weekday()]
        tanggal = today.strftime("%d %B %Y")

        task_text = "\n".join([
            f"- {i+1}. {t.get('title')} "
            f"(deadline: {t.get('deadline', 'tidak ada')}, "
            f"kategori: {t.get('category', '-')})"
            for i, t in enumerate(top_tasks[:3])
        ])

        peak_text = ", ".join(peak_hours[:3]) if peak_hours else "09:00, 10:00, 11:00"

        prokrastinasi_text = ""
        if procrastination_flags:
            prokrastinasi_text = f"\nTask yang perlu perhatian khusus: {', '.join([t.get('title', '') for t in procrastination_flags])}"

        completion_text = ""
        if completion_rate is not None:
            pct = round(completion_rate * 100)
            completion_text = f"\nTingkat penyelesaian tugas minggu ini: {pct}%"

        prompt = f"""Kamu adalah asisten produktivitas bernama Planno.
Buat daily briefing pagi yang singkat, motivatif, dan personal untuk {user_name}.

Informasi hari ini:
- Hari: {hari}, {tanggal}
- Jam produktif puncak: {peak_text}
- 3 tugas prioritas:
{task_text}{prokrastinasi_text}{completion_text}

Buat briefing dalam Bahasa Indonesia yang:
1. Dimulai dengan sapaan hangat menyebut nama {user_name}
2. Sebutkan jam produktif puncak dan sarankan mulai dengan task terpenting
3. Berikan 1 kalimat motivasi yang relevan
4. Maksimal 4 kalimat total
5. Nada: ramah, to-the-point, tidak berlebihan

Langsung tulis briefingnya tanpa judul atau label apapun."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "Kamu adalah asisten produktivitas Planno. Selalu balas dalam Bahasa Indonesia yang hangat dan singkat."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=200
            )

            briefing_text = response.choices[0].message.content.strip()

            return {
                "success": True,
                "briefing_text": briefing_text,
                "top_tasks": top_tasks[:3],
                "peak_hours": peak_hours[:3],
                "generated_at": today.strftime("%Y-%m-%d %H:%M")
            }

        except Exception as e:
            return {
                "success": False,
                "briefing_text": None,
                "error": f"Gagal generate briefing: {str(e)}"
            }

    def generate_simple(self, user_name: str, top_tasks: list) -> str:
        """
        Versi sederhana generate briefing tanpa data energi.
        Berguna untuk testing cepat.

        Args:
            user_name (str): Nama user
            top_tasks (list): List task prioritas

        Returns:
            str: Teks briefing
        """
        hasil = self.generate(
            user_name=user_name,
            top_tasks=top_tasks,
            peak_hours=["09:00", "10:00", "11:00"]
        )
        return hasil.get("briefing_text", "Selamat pagi! Semangat hari ini!")