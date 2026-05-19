from groq import Groq
import json
import os
import re
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()


class TaskParser:
    """
    Modul untuk parsing input bahasa natural menjadi data task terstruktur.
    Menggunakan Groq API dengan model llama-3.1-8b-instant.

    Perbaikan v3:
    - Mendukung kata relatif waktu: besok, lusa, minggu depan, dll
    - Title diambil persis dari input user, tidak diinterpretasikan ulang
    - Deteksi type: Tugas vs Acara secara akurat
    - Kategori: Akademik > Kerja > Personal > Lainnya
    - Output sesuai format frontend (Bahasa Indonesia)

    Cara pakai:
        parser = TaskParser()
        hasil = parser.parse("main sama teman ke pakuwon besok jam 21.00 sampai 23.00")
        print(hasil)
    """

    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model  = "llama-3.1-8b-instant"

    def _hitung_tanggal_relatif(self, today: datetime) -> dict:
        """Hitung tanggal aktual untuk kata relatif waktu agar LLM tidak menebak."""
        besok     = today + timedelta(days=1)
        lusa      = today + timedelta(days=2)
        tiga_hari = today + timedelta(days=3)

        weekday   = today.weekday()
        nama_hari = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"]

        hari_minggu_ini = {}
        for i, nama in enumerate(nama_hari):
            tgl = today + timedelta(days=(i - weekday))
            hari_minggu_ini[nama] = tgl.strftime("%Y-%m-%d")

        minggu_depan_senin = today + timedelta(days=(7 - weekday))

        return {
            "hari_ini"          : today.strftime("%Y-%m-%d"),
            "besok"             : besok.strftime("%Y-%m-%d"),
            "lusa"              : lusa.strftime("%Y-%m-%d"),
            "3_hari_lagi"       : tiga_hari.strftime("%Y-%m-%d"),
            "minggu_depan_mulai": minggu_depan_senin.strftime("%Y-%m-%d"),
            "hari_minggu_ini"   : hari_minggu_ini,
            "nama_hari_ini"     : nama_hari[weekday],
            "nama_besok"        : nama_hari[(weekday + 1) % 7],
            "nama_lusa"         : nama_hari[(weekday + 2) % 7],
        }

    def parse(self, raw_input: str) -> dict:
        """
        Parse kalimat bebas user menjadi data task terstruktur.

        Returns:
            dict: {
                success (bool),
                title (str)     : judul persis dari input user,
                type (str)      : "Tugas" atau "Acara",
                deadline (str)  : format YYYY-MM-DD HH:MM atau null,
                duration_minutes (int | None),
                category (str)  : Akademik / Kerja / Personal / Lainnya,
                importance (str): high / medium / low (untuk priority_scorer),
                error (str | None)
            }
        """
        if not raw_input or len(raw_input.strip()) == 0:
            return {"success": False, "error": "Input tidak boleh kosong"}

        today     = datetime.now()
        today_str = today.strftime("%Y-%m-%d")
        day_name  = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"][today.weekday()]
        tanggal   = self._hitung_tanggal_relatif(today)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """Kamu adalah parser tugas untuk aplikasi Planno.
Tugasmu HANYA mengembalikan JSON valid tanpa teks apapun sebelum atau sesudahnya.
Jangan tulis penjelasan. Jangan tulis markdown. Hanya JSON murni.

=== ATURAN WAJIB ===
1. Field "title" HARUS diambil langsung dari inti kalimat input — jangan ubah, jangan interpretasikan ulang.
   - "main sama teman" → title: "main sama teman" (BUKAN "bermain bersama teman")
   - "beli kopi" → title: "beli kopi" (BUKAN "membeli minuman")
   - "nonton film" → title: "nonton film" (BUKAN "menonton bioskop")

2. Field "type" harus AKURAT:
   - "Tugas" = sesuatu yang harus DIKERJAKAN/DISELESAIKAN (laporan, belajar, submit, baca, ngerjain)
   - "Acara" = sesuatu yang akan DIHADIRI/DILAKUKAN/DIALAMI (main, nonton, jalan, meeting, makan, kumpul, hangout, rapat, seminar, kuliah, les)
   - Kata kunci Acara: main, jalan, nonton, makan, kumpul, hangout, pergi, datang, hadir, ikut, rapat, meeting, seminar, kuliah, les, latihan, olahraga
   - Kata kunci Tugas: kerjakan, buat, tulis, selesaikan, submit, kumpulkan, belajar, review, baca, persiapkan, siapkan

3. Field "category" ikuti urutan prioritas: Akademik > Kerja > Personal > Lainnya
   - Akademik: kuliah, tugas kuliah, ujian, skripsi, belajar, submit tugas, penelitian, seminar kampus, les, kelas
   - Kerja: meeting kantor, klien, laporan kerja, presentasi kantor, PKL, magang, rapat kerja
   - Personal: teman, keluarga, hobi, belanja, jalan-jalan, nonton, main, ngopi, hangout, olahraga pribadi
   - Lainnya: apapun yang tidak masuk kategori di atas"""
                    },
                    {
                        "role": "user",
                        "content": f"""
Ekstrak informasi dari kalimat berikut menjadi JSON.

Kalimat: "{raw_input}"
Hari ini: {today_str} ({day_name})

=== REFERENSI TANGGAL ===
- "hari ini"     = {tanggal['hari_ini']}
- "besok"        = {tanggal['besok']} ({tanggal['nama_besok']})
- "lusa"         = {tanggal['lusa']} ({tanggal['nama_lusa']})
- "3 hari lagi"  = {tanggal['3_hari_lagi']}
- "minggu depan" = mulai {tanggal['minggu_depan_mulai']}
- "Senin ini"    = {tanggal['hari_minggu_ini'].get('Senin','')}
- "Selasa ini"   = {tanggal['hari_minggu_ini'].get('Selasa','')}
- "Rabu ini"     = {tanggal['hari_minggu_ini'].get('Rabu','')}
- "Kamis ini"    = {tanggal['hari_minggu_ini'].get('Kamis','')}
- "Jumat ini"    = {tanggal['hari_minggu_ini'].get('Jumat','')}
- "Sabtu ini"    = {tanggal['hari_minggu_ini'].get('Sabtu','')}
- "Minggu ini"   = {tanggal['hari_minggu_ini'].get('Minggu','')}

=== PANDUAN WAKTU ===
- "pagi"  = 09:00, "siang" = 12:00, "sore" = 17:00, "malam" = 19:00
- Jam spesifik (misal "jam 21.00") → gunakan persis jam itu: 21:00
- "sampai jam X" → hitung duration_minutes dari selisih jam mulai dan jam akhir
- Tidak ada info waktu → null untuk deadline

=== PANDUAN IMPORTANCE (untuk prioritas) ===
- "high"   : Akademik atau Kerja
- "medium" : Personal
- "low"    : Lainnya

Output HANYA JSON (tidak ada teks lain):
{{"title": "...", "type": "Tugas atau Acara", "deadline": "YYYY-MM-DD HH:MM atau null", "duration_minutes": angka atau null, "category": "Akademik/Kerja/Personal/Lainnya", "importance": "high/medium/low"}}
"""
                    }
                ]
            )

            raw = response.choices[0].message.content.strip()
            json_match = re.search(r'\{.*\}', raw, re.DOTALL)

            if json_match:
                parsed = json.loads(json_match.group())
                parsed["success"]   = True
                parsed["raw_input"] = raw_input
                parsed["error"]     = None
                return parsed
            else:
                return {
                    "success": False, "raw_input": raw_input,
                    "error": "Format JSON tidak ditemukan dalam response"
                }

        except json.JSONDecodeError:
            return {
                "success": False, "raw_input": raw_input,
                "error": "Gagal memproses response dari AI"
            }
        except Exception as e:
            return {
                "success": False, "raw_input": raw_input,
                "error": f"Terjadi kesalahan: {str(e)}"
            }
