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
    Versi 6 - aturan kategori sangat lengkap, jam diekstrak Python.
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
            # ← FIX: kalau hasilnya negatif (hari sudah lewat minggu ini), pakai minggu depan
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

    def _ekstrak_jam(self, raw_input: str) -> tuple:
        text = raw_input.lower()

        def fmt(t):
            if t is None: return None
            return f"{t[0]:02d}:{t[1]:02d}"

        p1 = re.search(
            r'jam\s+(\d{1,2}(?:[\.:]?\d{2})?)\s*(pagi|siang|sore|malam)?\s*(?:sampai|hingga|s[/\-]d|–|-)\s*(\d{1,2}(?:[\.:]?\d{2})?)\s*(pagi|siang|sore|malam)?',
            text
        )
        if p1:
            mulai   = self._parse_jam_token(p1.group(1), p1.group(2) or "")
            selesai = self._parse_jam_token(p1.group(3), p1.group(4) or "")
            return fmt(mulai), fmt(selesai)

        p2 = re.search(
            r'pukul\s+(\d{1,2}(?:[\.:]?\d{2})?)\s*(pagi|siang|sore|malam)?\s*(?:sampai|hingga|–|-)\s*(\d{1,2}(?:[\.:]?\d{2})?)\s*(pagi|siang|sore|malam)?',
            text
        )
        if p2:
            mulai   = self._parse_jam_token(p2.group(1), p2.group(2) or "")
            selesai = self._parse_jam_token(p2.group(3), p2.group(4) or "")
            return fmt(mulai), fmt(selesai)

        p3 = re.search(r'(?:jam|pukul)\s+(\d{1,2}(?:[\.:]?\d{2})?)\s*(pagi|siang|sore|malam)?', text)
        if p3:
            mulai = self._parse_jam_token(p3.group(1), p3.group(2) or "")
            return fmt(mulai), None

        if "pagi" in text:   return "09:00", None
        if "siang" in text:  return "12:00", None
        if "sore" in text:   return "17:00", None
        if "malam" in text:  return "19:00", None

        return None, None

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

    def _format_deadline(self, tanggal: str, jam_mulai: str):
        if not tanggal:
            return None
        if jam_mulai:
            return f"{tanggal} {jam_mulai}"
        return f"{tanggal} 00:00"

    def _deteksi_type(self, raw_input: str):
        """Deteksi type Tugas/Acara menggunakan regex Python."""
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

        # Acara menang jika terdeteksi, kecuali ada kata tugas yang eksplisit
        if is_acara and not is_tugas:
            return "Acara"
        if is_tugas and not is_acara:
            return "Tugas"
        if is_acara and is_tugas:
            return "Acara"  # Acara menang jika keduanya terdeteksi
        return None

    def parse(self, raw_input: str, client_now: str | None = None) -> dict:
        if not raw_input or len(raw_input.strip()) == 0:
            return {"success": False, "error": "Input tidak boleh kosong"}

        if client_now:
            try:
                today = datetime.strptime(client_now, "%Y-%m-%d %H:%M")
            except ValueError:
                today = datetime.now()
        else:
            today = datetime.now()
        today_str = today.strftime("%Y-%m-%d")
        day_name  = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"][today.weekday()]
        tanggal   = self._hitung_tanggal_relatif(today)

        jam_mulai, jam_selesai = self._ekstrak_jam(raw_input)
        duration_minutes = self._hitung_durasi(jam_mulai, jam_selesai)
        type_python = self._deteksi_type(raw_input)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """Kamu adalah sistem ekstrak informasi tugas untuk aplikasi Planno.
Kembalikan HANYA JSON valid. Tidak ada teks lain. Tidak ada markdown. Tidak ada penjelasan.

=== ATURAN TITLE ===
Ambil judul PERSIS dari inti kalimat input. Jangan ubah, jangan terjemahkan, jangan ringkas, gunakan TitleCase.
Hapus hanya informasi waktu (jam, tanggal) dari title.
Contoh:
- "kerjakan laporan capstone besok jam 10" → "Kerjakan Laporan Capstone"
- "main sama teman ke pakuwon besok jam 13" → "Main Sama Teman Ke Pakuwon"
- "belajar untuk ujian statistik lusa jam 8" → "Belajar untuk Ujian Statistik"
- "menonton seminar hari ini jam 15" → "Menonton Seminar"
- "beli kopi di warung pagi ini" → "Beli Kopi di Warung"
- "submit laporan PKL besok" → "Submit Laporan PKL"

=== ATURAN TYPE ===
"Acara" = aktivitas yang DIHADIRI/DILAKUKAN/DIALAMI pada waktu tertentu (ada di tempat/lokasi):
Kata kunci Acara:
- Kegiatan sosial: main, hangout, kumpul, nongkrong, jalan-jalan, piknik, liburan, wisata
- Hiburan: nonton, nobar, karaoke, konser, pameran, festival, pertandingan, olahraga
- Makan: makan, makan malam, makan siang, sarapan, ngopi, ngeteh, dinner, lunch, breakfast
- Akademik hadir: kuliah, kelas, les, bimbingan, seminar, workshop, webinar, diskusi kelompok, sidang, ujian lisan, presentasi (hadir)
- Kerja hadir: rapat, meeting, briefing, interview, wawancara, site visit, kunjungan
- Ibadah: sholat, ibadah, misa, gereja, pengajian

"Tugas" = sesuatu yang harus DIKERJAKAN/DISELESAIKAN/DIBUAT:
Kata kunci Tugas:
- Pengerjaan: kerjakan, buat, tulis, selesaikan, kumpulkan, submit, upload, kirim
- Belajar mandiri: belajar, review, baca, pelajari, hafal, latihan soal, ngerjain soal
- Persiapan: siapkan, persiapkan, prepare, riset, research, analisis, rangkum
- Administrasi: daftar, registrasi, bayar, isi formulir, lengkapi berkas, scan dokumen

=== ATURAN CATEGORY ===

--- AKADEMIK ---
Kata kunci utama: kuliah, kampus, tugas kuliah, mata kuliah, dosen, mahasiswa, akademik, semester, ipk
Mata kuliah: statistik, matematika, kalkulus, aljabar, fisika, kimia, biologi, ekonomi, akuntansi, manajemen, hukum, psikologi, sosiologi, antropologi, sejarah, geografi, bahasa, sastra, filsafat, logika, etika, pemrograman, algoritma, struktur data, basis data, jaringan komputer, sistem operasi, kecerdasan buatan, machine learning, data science, cloud computing, keamanan siber, rekayasa perangkat lunak
Kegiatan akademik: ujian, uts, uas, kuis, quiz, presentasi kuliah, diskusi kuliah, seminar kampus, workshop kampus, kuliah tamu, praktikum, lab, tugas kelompok (kuliah), makalah, paper, jurnal, skripsi, thesis, disertasi, capstone, kerja praktik (kp), pkl (yang akademik), krs, kartu rencana studi, bimbingan skripsi, sidang skripsi, yudisium, wisuda
Belajar: belajar (untuk ujian/kuliah/mata kuliah tertentu), review materi kuliah, baca buku kuliah, latihan soal kuliah, rangkum materi

Contoh Akademik:
- "belajar untuk ujian statistik" → Akademik
- "belajar statistik" → Akademik
- "kerjakan tugas algoritma" → Akademik
- "bimbingan skripsi" → Akademik
- "presentasi capstone" → Akademik
- "kuliah kalkulus" → Akademik
- "submit laporan praktikum" → Akademik
- "ngerjain soal fisika" → Akademik
- "review materi basis data" → Akademik
- "ujian akhir semester" → Akademik

--- KERJA ---
Kata kunci utama: kantor, klien, client, atasan, boss, rekan kerja, perusahaan, bisnis, proyek kerja, deadline kerja
Kegiatan kerja: rapat kantor, meeting klien, presentasi kantor, laporan kerja, laporan bulanan, laporan tahunan, email klien, proposal bisnis, kontrak, invoice, administrasi kantor, rekap data kerja, analisis bisnis, training kerja, onboarding, review kode (kerja), deploy aplikasi (kerja), maintenance server
Tempat kerja: kantor, perusahaan, startup, pabrik, toko, klinik (kerja), rumah sakit (kerja), sekolah (kerja)
PKL/magang yang kerja: PKL di perusahaan, magang di kantor, praktik kerja

Contoh Kerja:
- "meeting dengan klien jam 10" → Kerja
- "buat laporan bulanan kantor" → Kerja
- "rapat tim marketing" → Kerja
- "kirim proposal ke klien" → Kerja
- "presentasi hasil kerja ke atasan" → Kerja

--- PERSONAL ---
Kata kunci utama: teman, sahabat, keluarga, pacar, saudara, orang tua, adik, kakak, ibu, ayah, mama, papa
Kegiatan sosial: main, hangout, nongkrong, kumpul bareng, jalan bareng, liburan, piknik, wisata
Hiburan: nonton film, nobar, karaoke, konser, festival, pameran seni, pertandingan olahraga (nonton)
Makan bersama: makan bareng, makan malam bareng, dinner bareng, ngopi bareng, ngeteh bareng
Olahraga pribadi: gym, fitness, lari, jogging, renang, bersepeda, yoga, meditasi, olahraga pagi
Belanja pribadi: belanja, shopping, beli (barang pribadi), ke mall, ke pasar
Kesehatan pribadi: dokter, periksa kesehatan, medical checkup, ke klinik (pribadi), beli obat
Urusan pribadi: potong rambut, laundry, bersih-bersih rumah, masak, bayar tagihan pribadi
Ibadah: sholat, ibadah, gereja, pengajian, ngaji

Contoh Personal:
- "main sama teman ke pakuwon" → Personal
- "nonton film sama pacar" → Personal
- "makan malam bareng keluarga" → Personal
- "gym pagi hari" → Personal
- "belanja bulanan ke supermarket" → Personal
- "ngopi sama sahabat" → Personal
- "jalan-jalan ke mall" → Personal

--- LAINNYA ---
Semua yang tidak masuk Akademik, Kerja, atau Personal:
- Urusan administrasi umum: bayar listrik, isi bensin, servis motor/mobil, ke bank, ke kantor pos
- Tidak jelas konteksnya
- Kegiatan umum tanpa konteks spesifik

=== CONTOH LENGKAP ===
Input → {"title", "type", "category"}
"kerjakan laporan capstone besok" → {"title": "kerjakan laporan capstone", "type": "Tugas", "category": "Akademik"}
"belajar untuk ujian statistik lusa" → {"title": "belajar untuk ujian statistik", "type": "Tugas", "category": "Akademik"}
"belajar kalkulus besok pagi" → {"title": "belajar kalkulus", "type": "Tugas", "category": "Akademik"}
"main sama teman besok siang" → {"title": "main sama teman", "type": "Acara", "category": "Personal"}
"nonton film sama pacar malam ini" → {"title": "nonton film sama pacar", "type": "Acara", "category": "Personal"}
"meeting klien jam 10" → {"title": "meeting klien", "type": "Acara", "category": "Kerja"}
"buat laporan kantor besok" → {"title": "buat laporan kantor", "type": "Tugas", "category": "Kerja"}
"kuliah algoritma jam 8" → {"title": "kuliah algoritma", "type": "Acara", "category": "Akademik"}
"seminar capstone hari ini" → {"title": "seminar capstone", "type": "Acara", "category": "Akademik"}
"gym pagi ini" → {"title": "gym", "type": "Acara", "category": "Personal"}
"beli obat di apotek" → {"title": "beli obat di apotek", "type": "Tugas", "category": "Personal"}
"bayar listrik besok" → {"title": "bayar listrik", "type": "Tugas", "category": "Lainnya"}
"servis motor sabtu" → {"title": "servis motor", "type": "Tugas", "category": "Lainnya"}
"ngerjain soal fisika malam ini" → {"title": "ngerjain soal fisika", "type": "Tugas", "category": "Akademik"}
"review materi basis data sebelum ujian" → {"title": "review materi basis data", "type": "Tugas", "category": "Akademik"}
"presentasi skripsi besok" → {"title": "presentasi skripsi", "type": "Acara", "category": "Akademik"}
"rapat tim besok pagi" → {"title": "rapat tim", "type": "Acara", "category": "Kerja"}
"kirim proposal klien hari ini" → {"title": "kirim proposal klien", "type": "Tugas", "category": "Kerja"}
"jalan-jalan ke mall sama adik" → {"title": "jalan-jalan ke mall sama adik", "type": "Acara", "category": "Personal"}
"ngopi sama teman lama" → {"title": "ngopi sama teman lama", "type": "Acara", "category": "Personal"}"""
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

Output HANYA JSON ini (tidak ada teks lain):
{{"title": "...", "type": "Tugas atau Acara", "tanggal": "YYYY-MM-DD atau null", "category": "Akademik/Kerja/Personal/Lainnya"}}"""
                    }
                ]
            )

            raw = response.choices[0].message.content.strip()
            json_match = re.search(r'\{.*\}', raw, re.DOTALL)

            if not json_match:
                return {"success": False, "raw_input": raw_input, "error": "Format JSON tidak ditemukan"}

            llm_data = json.loads(json_match.group())
            category = llm_data.get("category", "Lainnya")
            tgl_str  = llm_data.get("tanggal")
            deadline = self._format_deadline(tgl_str, jam_mulai)

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

            return {
                "success"         : True,
                "title"           : llm_data.get("title", raw_input),
                "type"            : type_python or llm_data.get("type", "Tugas"),
                "deadline"        : deadline,
                "jam_mulai"       : jam_mulai,
                "jam_selesai"     : jam_selesai,
                "duration_minutes": duration_minutes,
                "category"        : category_en,
                "importance"      : importance_map.get(category_en, "low"),
                "raw_input"       : raw_input,
                "error"           : None,
            }

        except json.JSONDecodeError:
            return {"success": False, "raw_input": raw_input, "error": "Gagal parsing JSON dari AI"}
        except Exception as e:
            return {"success": False, "raw_input": raw_input, "error": f"Terjadi kesalahan: {str(e)}"}