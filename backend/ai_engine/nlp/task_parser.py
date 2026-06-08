from groq import Groq
import json
import os
import re
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()


class TaskParser:
    """
    Modul parsing input bahasa natural ke data task terstruktur.
    Versi 7 - support deadline terpisah dari waktu kegiatan.
    """

    def __init__(self):
        custom_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        }
        self.client = Groq(
            api_key=os.getenv("GROQ_API_KEY"),
            default_headers=custom_headers
        )
        self.model = "llama-3.1-8b-instant"

    def _hitung_tanggal_relatif(self, today: datetime) -> dict:
        besok     = today + timedelta(days=1)
        lusa      = today + timedelta(days=2)
        tiga_hari = today + timedelta(days=3)
        weekday   = today.weekday()
        nama_hari = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"]

        hari_minggu_ini = {}
        for i, nama in enumerate(nama_hari):
            diff = i - weekday
            if diff < 0:
                diff += 7
            tgl = today + timedelta(days=diff)
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

    def _parse_jam_token(self, jam_str: str, konteks: str = "") -> tuple:
        jam_str = jam_str.strip()
        m = re.match(r'^(\d{1,2})[\.:](\d{2})$', jam_str)
        if m:
            return (int(m.group(1)), int(m.group(2)))
        m = re.match(r'^(\d{1,2})$', jam_str)
        if m:
            h = int(m.group(1))
            if "pagi" in konteks:
                return (h, 0)
            elif "siang" in konteks:
                return (12 if h >= 10 else h, 0)
            elif "sore" in konteks:
                return (h + 12 if h < 12 else h, 0)
            elif "malam" in konteks:
                return (h + 12 if h < 12 else h, 0)
            return (h, 0)
        return None

    def _fmt(self, t) -> str | None:
        if t is None:
            return None
        return f"{t[0]:02d}:{t[1]:02d}"

    def _ekstrak_jam_kegiatan(self, raw_input: str) -> tuple:
        """
        Ekstrak jam_mulai dan jam_selesai dari waktu kegiatan (bukan deadline).
        Dipastikan hanya membaca bagian SEBELUM kata kunci deadline.
        """
        text = raw_input.lower()

        # 1. Potong teks secara ketat sebelum kata deadline agar tidak bercampur
        for kata in ["deadline", "kumpul", "submit", "dikumpul", "batas"]:
            idx = text.find(kata)
            if idx != -1:
                text = text[:idx]

        # 2. Pattern 1: Deteksi format rentang tegas seperti "14-17" atau "14.00-17.00" atau "jam 14:00 - 17:00"
        # Menangani spasi di sekitar tanda hubung secara fleksibel
        range_p = re.search(
            r'(?:jam|pukul)?\s*(\d{1,2}(?:[\.:]\d{2})?)\s*(?:\s*[-–]\s*|sampai|hingga|s[/\-]d)\s*(\d{1,2}(?:[\.:]\d{2})?)\s*(pagi|siang|sore|malam)?',
            text
        )
        if range_p:
            mulai   = self._parse_jam_token(range_p.group(1), range_p.group(3) or "")
            selesai = self._parse_jam_token(range_p.group(2), range_p.group(3) or "")
            if mulai and selesai:
                return self._fmt(mulai), self._fmt(selesai)

        # 3. Pattern 2: Jika user menulis terpisah "jam 14 sampai 17"
        range_p2 = re.search(r'(?:jam|pukul)\s*(\d{1,2})\s*(?:sampai|hingga)\s*(\d{1,2})', text)
        if range_p2:
            mulai   = self._parse_jam_token(range_p2.group(1))
            selesai = self._parse_jam_token(range_p2.group(2))
            if mulai and selesai:
                return self._fmt(mulai), self._fmt(selesai)

        # 4. Pattern 3: Jika hanya ada satu jam pengerjaan tunggal (misal: "jam 14")
        single_p = re.search(r'(?:jam|pukul)\s+(\d{1,2}(?:[\.:]\d{2})?)\s*(pagi|siang|sore|malam)?', text)
        if single_p:
            mulai = self._parse_jam_token(single_p.group(1), single_p.group(2) or "")
            return self._fmt(mulai), None

        # 5. Fallback kata penunjuk waktu kasar
        if "pagi" in text:   return "09:00", None
        if "siang" in text:  return "12:00", None
        if "sore" in text:   return "17:00", None
        if "malam" in text:  return "19:00", None

        return None, None

    def _ekstrak_deadline_time(self, raw_input: str) -> str | None:
        """
        Ekstrak jam deadline secara terpisah (hanya mendeteksi teks SETELAH kata deadline).
        """
        text = raw_input.lower()
        
        # Cari posisi kata kunci deadline
        start_idx = -1
        for kata in ["deadline", "kumpul", "submit", "dikumpul", "batas"]:
            idx = text.find(kata)
            if idx != -1:
                start_idx = idx
                break
        
        # Jika tidak ada kata kunci deadline, jangan tebak jam deadline dari jam kegiatan
        if start_idx == -1:
            return None
            
        deadline_text = text[start_idx:]

        # Cari pola "jam X" atau "pukul X" setelah kata deadline
        p = re.search(r'(?:jam|pukul)\s+(\d{1,2}(?:[\.:]\d{2})?)\s*(pagi|siang|sore|malam)?', deadline_text)
        if p:
            t = self._parse_jam_token(p.group(1), p.group(2) or "")
            return self._fmt(t)

        # Cari pola angka langsung setelah kata deadline (misal: "deadline selasa 23")
        p2 = re.search(r'(?:\b\d{1,2}(?:[\.:]\d{2})?\b)', deadline_text)
        if p2:
            t = self._parse_jam_token(p2.group(0))
            return self._fmt(t)

        return None

    def _ekstrak_deadline_time(self, raw_input: str) -> str | None:
        """
        Ekstrak jam deadline secara terpisah dari waktu kegiatan.
        """
        text = raw_input.lower()

        # Pattern: kata deadline/kumpul/submit diikuti jam
        kata_deadline = r'(?:deadline|kumpul|dikumpul|submit|batas(?:\s+waktu)?|kumpulkan)'
        p = re.search(
            kata_deadline + r'.*?(?:jam|pukul)\s+(\d{1,2}(?:[\.:]?\d{2})?)\s*(pagi|siang|sore|malam)?',
            text
        )
        if p:
            t = self._parse_jam_token(p.group(1), p.group(2) or "")
            return self._fmt(t)

        # Pattern: jam angka setelah kata deadline (misal "deadline 8" atau "deadline 23.59")
        p2 = re.search(
            kata_deadline + r'\s+(?:\w+\s+)?(\d{1,2}(?:[\.:]?\d{2})?)',
            text
        )
        if p2:
            t = self._parse_jam_token(p2.group(1))
            return self._fmt(t)

        return None

    def _hitung_durasi(self, jam_mulai: str, jam_selesai: str):
        if not jam_mulai or not jam_selesai:
            return None
        try:
            def to_min(s):
                h, m = map(int, s.split(":"))
                return h * 60 + m
            dur = to_min(jam_selesai) - to_min(jam_mulai)
            return dur if dur > 0 else None
        except:
            return None

    def _format_deadline(self, tanggal: str, jam: str) -> str | None:
        if not tanggal:
            return None
        if jam:
            return f"{tanggal} {jam}"
        return f"{tanggal} 00:00"

    def _deteksi_type(self, raw_input: str):
        text = " " + raw_input.lower() + " "

        kata_acara = [
            ' main ', ' hangout ', ' kumpul ', ' nongkrong ',
            'jalan-jalan', 'jalan bareng', 'jalan sama',
            ' piknik ', ' liburan ', ' wisata ',
            ' nonton ', ' nobar ', ' karaoke ', ' konser ',
            ' pameran ', ' festival ', ' pertandingan ',
            'makan bareng', 'makan sama', 'makan malam', 'makan siang',
            'sarapan bareng', 'sarapan sama',
            ' ngopi ', ' ngeteh ', ' dinner ', ' lunch ', ' breakfast ',
            'kuliah ', ' kelas ', ' les ', ' bimbingan ',
            ' seminar ', ' workshop ', ' webinar ',
            'diskusi kelompok', ' sidang ', 'ujian lisan',
            ' praktikum ', 'kuliah tamu',
            ' rapat ', ' meeting ', ' briefing ',
            ' interview ', ' wawancara ', ' kunjungan ',
            ' sholat ', ' ibadah ', ' misa ', ' gereja ',
            ' pengajian ', ' ngaji ',
            ' gym ', 'lari pagi', ' jogging ', ' renang ',
            ' bersepeda ', ' yoga ', ' meditasi ',
            'ke dokter', 'ke klinik',
            'presentasi skripsi', 'presentasi capstone',
            'sidang skripsi',
        ]

        kata_tugas = [
            ' kerjakan ', ' ngerjain ', ' selesaikan ',
            ' kumpulkan ', ' submit ', ' upload ',
            'kirim laporan', 'kirim tugas', 'kirim proposal',
            'buat laporan', 'buat makalah', 'buat slide', 'buat kode',
            'tulis laporan', 'tulis makalah', 'tulis paper',
            ' belajar ', 'review materi', 'baca buku', 'baca materi',
            ' pelajari ', ' hafal ', 'latihan soal', 'ngerjain soal',
            ' rangkum ', 'analisis data', ' riset ',
            ' siapkan ', ' persiapkan ', ' prepare ',
            'bayar tagihan', 'bayar listrik', 'bayar air',
            'isi formulir', 'lengkapi berkas', 'scan dokumen',
            'daftar krs', 'isi krs', ' perpanjang ', ' servis ',
        ]

        is_acara = any(k in text for k in kata_acara)
        is_tugas = any(k in text for k in kata_tugas)

        if is_acara and not is_tugas:
            return "Acara"
        if is_tugas and not is_acara:
            return "Tugas"
        if is_acara and is_tugas:
            return "Acara"
        return None
    
    def parse(self, raw_input: str, client_now: str = None) -> dict:
        try:
            # 1. Inisialisasi waktu dasar dari client_now
            if client_now:
                try:
                    dt_now = datetime.strptime(client_now, "%Y-%m-%d %H:%M")
                except:
                    dt_now = datetime.now()
            else:
                dt_now = datetime.now()

            today_str = dt_now.strftime("%Y-%m-%d")
            nama_hari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
            day_name = nama_hari[dt_now.weekday()]
            tanggal = self._hitung_tanggal_relatif(dt_now)

            # 2. Ekstrak jam kegiatan & deadline secara independen menggunakan regex (Kunci Jam Selesai!)
            jam_mulai_raw, jam_selesai_raw = self._ekstrak_jam_kegiatan(raw_input)
            deadline_time = self._ekstrak_deadline_time(raw_input)

            jam_mulai = jam_mulai_raw if jam_mulai_raw else None
            jam_selesai = jam_selesai_raw if jam_selesai_raw else None

            # 3. Jalankan deteksi tipe berbasis rule-based
            type_python = self._deteksi_type(raw_input)

            # 4. Panggil LLM Groq untuk parsing teks dan tanggal
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """Kamu adalah sistem ekstrak informasi tugas untuk aplikasi Planno.
Kembalikan HANYA JSON valid. Tidak ada teks lain. Tidak ada markdown. Tidak ada penjelasan.

=== ATURAN TITLE ===
Ambil judul PERSIS dari inti kalimat input. Jangan ubah, jangan terjemahkan, jangan ringkas, gunakan TitleCase.
Hapus hanya informasi waktu (jam, tanggal, deadline) dari title.

=== ATURAN TYPE ===
"Acara" = aktivitas yang DIHADIRI/DILAKUKAN/DIALAMI pada waktu tertentu
"Tugas" = sesuatu yang harus DIKERJAKAN/DISELESAIKAN/DIBUAT

=== ATURAN TANGGAL KEGIATAN vs DEADLINE ===
Input bisa punya DUA tanggal berbeda:
1. "tanggal_kegiatan" = kapan aktivitas/pengerjaan berlangsung
2. "tanggal_deadline" = kapan batas pengumpulan/penyelesaian

=== ATURAN CATEGORY ===
AKADEMIK, KERJA, PERSONAL, LAINNYA

=== OUTPUT FORMAT ===
{
  "title": "...",
  "type": "Tugas atau Acara",
  "tanggal_kegiatan": "YYYY-MM-DD atau null",
  "tanggal_deadline": "YYYY-MM-DD atau null",
  "category": "Akademik/Kerja/Personal/Lainnya"
}"""
                    },
                    {
                        "role": "user",
                        "content": f"""Ekstrak dari kalimat ini:

Kalimat: "{raw_input}"
Hari ini: {today_str} ({day_name})

=== REFERENSI TANGGAL ===
- "hari ini"     = {tanggal['hari_ini']}
- "besok"        = {tanggal['besok']} ({tanggal['nama_besok']})
- "lusa"         = {tanggal['lusa']} ({tanggal['nama_lusa']})
- "3 hari lagi"  = {tanggal['3_hari_lagi']}
- "minggu depan" = {tanggal['minggu_depan_mulai']}
- "Senin"  = {tanggal['hari_minggu_ini'].get('Senin','')}
- "Selasa" = {tanggal['hari_minggu_ini'].get('Selasa','')}
- "Rabu"   = {tanggal['hari_minggu_ini'].get('Rabu','')}
- "Kamis"  = {tanggal['hari_minggu_ini'].get('Kamis','')}
- "Jumat"  = {tanggal['hari_minggu_ini'].get('Jumat','')}
- "Sabtu"  = {tanggal['hari_minggu_ini'].get('Sabtu','')}
- "Minggu" = {tanggal['hari_minggu_ini'].get('Minggu','')}

Output HANYA JSON:"""
                    }
                ]
            )

            raw = response.choices[0].message.content.strip()
            json_match = re.search(r'\{.*\}', raw, re.DOTALL)

            if not json_match:
                return {"success": False, "raw_input": raw_input, "error": "Format JSON tidak ditemukan"}

            llm_data = json.loads(json_match.group())

            category     = llm_data.get("category", "Lainnya")
            tgl_kegiatan = llm_data.get("tanggal_kegiatan")
            tgl_deadline = llm_data.get("tanggal_deadline")

            # 1. Kunci mati jam dari hasil regex murni
            if jam_mulai_raw:
                jam_mulai = jam_mulai_raw
            if jam_selesai_raw:
                jam_selesai = jam_selesai_raw

            # 2. Hitung durasi berdasarkan jam pengerjaan yang sudah dikunci
            duration_minutes = 60
            if jam_mulai and jam_selesai:
                dur = self._hitung_durasi(jam_mulai, jam_selesai)
                if dur: 
                    duration_minutes = dur

            # 3. Sinkronisasi deadline jam (Beneran terpisah dari jam selesai kegiatan)
            final_deadline_time = deadline_time if deadline_time else "23:59"
            if tgl_deadline:
                deadline = self._format_deadline(tgl_deadline, final_deadline_time)
            else:
                deadline = self._format_deadline(tgl_kegiatan or today_str, final_deadline_time)

            # 4. Mapping kategori ke english untuk sistem PriorityScorer
            category_map = {
                "Akademik": "academic",
                "Kerja"   : "work",
                "Personal": "personal",
                "Lainnya" : "health",
            }
            category_en = category_map.get(category, "health")

            importance_map = {
                "academic": "high",
                "work"    : "high",
                "personal": "medium",
                "health"  : "low",
            }

            # 5. Return data bersih ke FastAPI
            return {
                "success"         : True,
                "title"           : llm_data.get("title", raw_input),
                "type"            : type_python or llm_data.get("type", "Tugas"),
                "deadline"        : deadline,
                "jam_mulai"       : jam_mulai,
                "jam_selesai"     : jam_selesai,
                "tanggal_kegiatan": tgl_kegiatan or today_str,
                "duration_minutes": duration_minutes,
                "category"        : category_en,
                "importance"      : importance_map.get(category_en, "low"),
                "raw_input"       : raw_input,
                "error"           : None,
            }

        except Exception as e:
            print(f"CRASH LOG: {str(e)}")
            fallback_today = client_now.split(" ")[0] if client_now else "2026-06-08"
            return {
                "success"         : True,
                "title"           : raw_input,
                "type"            : "Tugas",
                "deadline"        : f"{fallback_today} 23:59",
                "jam_mulai"       : "17:00",
                "jam_selesai"     : "19:00",
                "tanggal_kegiatan": fallback_today,
                "duration_minutes": 120,
                "category"        : "health",
                "importance"      : "low",
                "error"           : str(e),
            }