# Planno

Planno adalah intelligent planner yang mengintegrasikan task management, calendar,
dan habit tracking dalam satu platform. Menggunakan machine learning untuk
mempelajari behavioral pattern user, aplikasi secara otomatis merekomendasikan daily
time blocks optimal, memprioritaskan tasks berdasarkan urgency dan energy level, serta
memberikan actionable insights tentang korelasi antara habits dan productivity.

Kelompok **Procrastinator**

| jabatan        | nama  | nim                |
| -------------- | ----- | ------------------ |
| Ketua Kelompok | Desi D Simamora  |23/514990/TK/56564
| Anggota 1      | Harun | 23/514148/TK/56466 |
| Anggota 2      | Maritza Vania Adelia     | 23/517643/TK/56944


Maritza Vania Adelia (23/517643/TK/56944) Inhal Modul 2

Desi D Simamora (23/514990/TK/56564) Inhal modul 2

## Tim Pengembang & Kontribusi

### Desi D Simamora — AI Engineer
Bertanggung jawab atas seluruh pengembangan AI Engine aplikasi Planno. 
Membangun modul `task_parser.py` untuk memproses input kalimat bebas 
pengguna menjadi data task terstruktur menggunakan pendekatan hybrid 
Python regex dan Groq API (LLaMA 3.1-8B). Mengembangkan `priority_scorer.py` 
dengan algoritma rule-based untuk menghitung priority score dan menentukan 
label prioritas berdasarkan deadline dan kategori aktivitas. Membangun 
`daily_briefing.py` untuk menghasilkan teks ringkasan harian yang personal 
menggunakan Generative AI. Menulis 40+ unit test 
menggunakan pytest dan melakukan evaluasi akurasi seluruh modul AI.

## Bukti Kontribusi
<img width="547" height="280" alt="des" src="https://github.com/user-attachments/assets/d2eb1d04-372d-47e2-9360-decca955f5e0" />


### Harun — Cloud Engineer
Bertanggung jawab atas pengembangan backend dan infrastruktur cloud aplikasi 
Planno. Membangun RESTful API menggunakan FastAPI dengan 5 endpoint utama 
yang menghubungkan frontend dengan AI Engine. Mengonfigurasi MongoDB sebagai 
database dengan Replica Set untuk mendukung Prisma transactions, serta 
mengelola skema database menggunakan Prisma ORM. Melakukan deployment 
frontend dan backend ke platform Vercel dengan konfigurasi environment 
variables dan integrasi CI/CD melalui GitHub sehingga setiap push ke branch 
main otomatis memicu proses build dan deployment.

## Bukti Kontribusi
<img width="551" height="267" alt="run" src="https://github.com/user-attachments/assets/2508f995-ffec-432d-a29d-6e4e666785e1" />


### Maritza — UI/UX Engineer
Bertanggung jawab atas seluruh pengembangan antarmuka pengguna aplikasi 
Planno. Merancang dan mengimplementasikan tampilan menggunakan Next.js 16 
dengan TypeScript dan Tailwind CSS. Membangun halaman autentikasi dengan 
Google OAuth melalui NextAuth v5, halaman planner dengan kanban board untuk visualisasi 
task berdasarkan prioritas, right sidebar untuk menampilkan daily briefing 
dan top 3 prioritas, serta focus mode dengan timer Pomodoro untuk sesi 
kerja terstruktur.

## Bukti Kontribusi
<img width="555" height="270" alt="cha" src="https://github.com/user-attachments/assets/8841613f-7f85-471f-b282-5197aebedf6a" />


