from groq import Groq
import json
import os
import re
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()


class TaskParser:
    """
    Modul untuk parsing input bahasa natural menjadi data task terstruktur.
    Menggunakan Groq API dengan model llama-3.1-8b-instant.

    Cara pakai:
        parser = TaskParser()
        hasil = parser.parse("kerjakan laporan riset besok jam 2 siang selama 2 jam")
        print(hasil)
    """

    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.1-8b-instant"

    def parse(self, raw_input: str) -> dict:
        """
        Parse kalimat bebas dari user menjadi data task terstruktur.

        Args:
            raw_input (str): Kalimat input dari user

        Returns:
            dict: Data task terstruktur dengan field:
                - success (bool)
                - title (str)
                - deadline (str | None): format YYYY-MM-DD HH:MM
                - duration_minutes (int | None)
                - category (str): academic/work/personal/health
                - error (str | None): pesan error jika gagal
        """

        if not raw_input or len(raw_input.strip()) == 0:
            return {
                "success": False,
                "error": "Input tidak boleh kosong"
            }

        today = datetime.now()
        today_str = today.strftime("%Y-%m-%d")
        day_name = ["Senin", "Selasa", "Rabu", "Kamis",
                    "Jumat", "Sabtu", "Minggu"][today.weekday()]

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """Kamu adalah parser tugas.
Tugasmu HANYA mengembalikan JSON valid tanpa teks apapun sebelum atau sesudahnya.
Jangan tulis penjelasan. Jangan tulis markdown. Hanya JSON murni."""
                    },
                    {
                        "role": "user",
                        "content": f"""
Ekstrak informasi dari kalimat berikut menjadi JSON.

Kalimat: "{raw_input}"
Hari ini: {today_str} ({day_name})

Panduan waktu:
- "pagi" = 09:00
- "siang" = 12:00
- "sore" = 17:00
- "malam" = 19:00
- Jika tidak ada info waktu spesifik = gunakan null untuk deadline

Panduan kategori:
- academic: tugas kuliah, ujian, skripsi, belajar, submit, penelitian
- work: meeting, klien, presentasi kantor, laporan kerja
- personal: belanja, teman, hobi, sosial, ngopi
- health: olahraga, dokter, obat, tidur, meditasi

Output HANYA JSON ini:
{{"title": "...", "deadline": "YYYY-MM-DD HH:MM atau null", "duration_minutes": angka atau null, "category": "..."}}
"""
                    }
                ]
            )

            raw = response.choices[0].message.content.strip()

            json_match = re.search(r'\{.*\}', raw, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group())
                parsed["success"] = True
                parsed["raw_input"] = raw_input
                parsed["error"] = None
                return parsed
            else:
                return {
                    "success": False,
                    "raw_input": raw_input,
                    "error": "Format JSON tidak ditemukan dalam response"
                }

        except json.JSONDecodeError:
            return {
                "success": False,
                "raw_input": raw_input,
                "error": "Gagal memproses response dari AI"
            }
        except Exception as e:
            return {
                "success": False,
                "raw_input": raw_input,
                "error": f"Terjadi kesalahan: {str(e)}"
            }