# Team Procrastinator

**Project Senior Project TI**

**Departemen Teknik Elektro dan Teknologi Informasi, Fakultas Teknik, Universitas Gadjah Mada**

---

## Anggota Kelompok

| Nama                 | NIM                | Peran                              |
| -------------------- | ------------------ | ---------------------------------- |
| Harun                | 23/514148/TK/56466 | Cloud Engineer & Software Engineer |
| Desi D Simamora      | 23/514990/TK/56564 | Project Manager & AI Engineer      |
| Maritza Vania Adelia | 23/517643/TK/56944 | Software Engineer & UI/UX Designer |

---

## Planno

**Intelligent Planner berbasis web dan mobile yang mengintegrasikan task management, calendar, dan habit tracking dalam satu platform.**

---

## Latar Belakang & Permasalahan

Berbagai laporan statistik menunjukkan bahwa permasalahan manajemen waktu dan prioritas merupakan isu global yang dialami oleh banyak individu lintas profesi. Data dari Market.Biz (2023) menunjukkan bahwa mayoritas pekerja merasa kewalahan (_overwhelmed_) oleh beban kerja harian, terutama akibat kurangnya sistem yang efektif untuk memprioritaskan tugas. Selain itu, gangguan digital seperti email, notifikasi, dan media sosial menyebabkan hilangnya rata-rata sekitar 2–3 jam waktu kerja efektif per hari, serta menurunkan produktivitas hingga 40% akibat _context switching_. Temuan ini diperkuat oleh laporan Superhuman (2023) yang menyatakan bahwa rata-rata pekerja hanya memiliki kurang dari 3 jam waktu kerja produktif dalam satu hari kerja penuh, sementara sisanya dihabiskan untuk aktivitas non-produktif seperti pengelolaan email dan penjadwalan ulang pekerjaan.

Permasalahan tersebut tidak hanya berdampak pada produktivitas, tetapi juga berkorelasi kuat dengan peningkatan stres dan risiko burnout. ZipDo (2023) melaporkan bahwa lebih dari 40% pekerja mengaitkan stres kerja mereka dengan buruknya manajemen waktu, bukan semata-mata karena volume pekerjaan. Gitnux (2023) juga menunjukkan bahwa ketiadaan sistem perencanaan yang adaptif membuat individu cenderung sibuk tanpa menghasilkan output yang optimal. Di sisi lain, sebagian besar alat bantu produktivitas yang tersedia masih bersifat pasif dan mengandalkan pengaturan manual, tanpa mempertimbangkan pola energi, kebiasaan, serta perilaku kerja pengguna. Kondisi ini menunjukkan perlunya solusi perencanaan berbasis data yang mampu mengotomatisasi penentuan prioritas tugas, penjadwalan waktu kerja yang selaras dengan tingkat energi dan kebiasaan pengguna, serta menyediakan pengukuran produktivitas secara objektif untuk membantu peningkatan kinerja secara berkelanjutan.

## Rumusan Permasalahan

1. Bagaimana membantu user memprioritaskan tasks secara optimal berdasarkan urgency dan personal working pattern?
2. Bagaimana mengotomatisasi time blocking yang sesuai dengan energy level dan habit user?
3. Bagaimana mengukur dan meningkatkan productivity user secara data-driven?

## Daftar Pustaka

- Market.Biz. (2023). _Time Management Statistics: Productivity and Workplace Distractions_. https://market.biz
- Superhuman. (2023). _Employee Productivity Statistics_. https://blog.superhuman.com
- ZipDo. (2023). _Time Management and Workplace Stress Statistics_. https://zipdo.co
- Gitnux. (2023). _Time Management and Productivity Statistics_. https://gitnux.org

---

## Ide Solusi

**Planno** adalah _intelligent planner_ yang mengintegrasikan task management, calendar, dan habit tracking dalam satu platform. Menggunakan machine learning untuk mempelajari behavioral pattern user, aplikasi secara otomatis merekomendasikan daily time blocks optimal, memprioritaskan tasks berdasarkan urgency dan energy level, serta memberikan actionable insights tentang korelasi antara habits dan productivity.

## Rancangan Fitur

| No. | Fitur                             | Keterangan                                                                                                                                                                                                                                                                        |
| --- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Smart Task Input**              | Memungkinkan pengguna menambahkan tugas dengan cepat menggunakan bahasa alami. Sistem secara otomatis mengekstraksi informasi penting seperti tenggat waktu, durasi pengerjaan, dan kategori tugas dari input pengguna.                                                           |
| 2   | **AI Task Prioritization**        | Menggunakan model machine learning untuk mengklasifikasikan tingkat urgensi dan kepentingan setiap tugas berdasarkan kedekatan tenggat waktu, tingkat kepentingan, pola penyelesaian tugas sebelumnya, serta keterkaitan antar tugas. Hasil ditampilkan dalam matriks Eisenhower. |
| 3   | **Intelligent Time Blocking**     | Sistem secara otomatis menyusun jadwal harian yang optimal menggunakan algoritma pengelompokan, dengan mempertimbangkan durasi tugas, jenis pekerjaan, pola energi pengguna, serta urgensi tenggat waktu.                                                                         |
| 4   | **Energy Pattern Learning**       | Pengguna mencatat tingkat energi harian, lalu data dianalisis untuk mengidentifikasi jam-jam performa terbaik. Tugas konsentrasi tinggi akan dijadwalkan pada periode energi tertinggi.                                                                                           |
| 5   | **Habit Tracker Integration**     | Pengguna mencatat kebiasaan harian (tidur, olahraga, meditasi). Sistem menganalisis hubungan antara kebiasaan dengan tingkat penyelesaian tugas dan produktivitas, lalu menyajikannya dalam visualisasi data.                                                                     |
| 6   | **Smart Rescheduling**            | Apabila terjadi keterlambatan atau muncul tugas mendesak baru, sistem menyesuaikan ulang jadwal secara otomatis dengan meminimalkan gangguan terhadap rencana awal.                                                                                                               |
| 7   | **Realistic Duration Prediction** | Mempelajari perbedaan antara estimasi waktu pengguna dan waktu pengerjaan aktual, lalu menyesuaikan estimasi durasi untuk tugas serupa di masa depan.                                                                                                                             |
| 8   | **Procrastination Detection**     | Mendeteksi pola penundaan dengan memantau tugas yang berulang kali dijadwalkan ulang. Memberikan notifikasi motivasional dan saran untuk memecah tugas menjadi bagian lebih kecil.                                                                                                |
| 9   | **Productivity Analytics**        | Dasbor analitik dengan metrik seperti tingkat penyelesaian tugas mingguan, distribusi waktu per kategori, korelasi kebiasaan dengan produktivitas, dan peta energi harian.                                                                                                        |
| 10  | **Focus Mode**                    | Integrasi teknik Pomodoro untuk membantu pengguna mempertahankan fokus dalam interval waktu tertentu dengan jeda istirahat terjadwal.                                                                                                                                             |
| 11  | **Daily Briefing**                | Ringkasan harian setiap pagi berisi rekomendasi tiga tugas prioritas utama beserta saran pembagian waktu pengerjaannya.                                                                                                                                                           |

---

## Analisis Kompetitor

### Todoist

| Atribut              | Detail                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| **Jenis Kompetitor** | Direct Competitor                                                                                      |
| **Jenis Produk**     | Task Management App (Web, Mobile, Desktop)                                                             |
| **Target Customer**  | Individuals & teams yang butuh simple, reliable task organizer (18–45 tahun, professionals & students) |

**Kelebihan:**

- Interface clean dan intuitive, easy onboarding
- Natural language input yang powerful (contoh: _"every Monday at 9am"_)
- Cross-platform sync sempurna (real-time)
- Gamification (Karma points, streaks) yang engaging
- Collaboration features (shared projects, comments)
- Extensive integrations (Slack, Gmail, Calendar, 80+ apps)

**Kekurangan:**

- Tidak ada AI-powered prioritization atau scheduling
- Tidak ada time blocking atau calendar view di free plan
- Habit tracking tidak tersedia
- Tidak belajar dari user behavior
- Productivity analytics terbatas (hanya Premium plan)
- Tidak ada energy-aware scheduling

**Key Competitive Advantage:** Simplicity dan reliability sebagai pure task manager dengan ecosystem integrations terluas di kategorinya.

---

### Motion

| Atribut              | Detail                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| **Jenis Kompetitor** | Direct Competitor                                                                                    |
| **Jenis Produk**     | AI Calendar & Task Manager (Web, Mobile)                                                             |
| **Target Customer**  | Busy professionals & executives yang willing to pay premium ($34/month) untuk time-saving automation |

**Kelebihan:**

- AI auto-scheduling tasks ke calendar berdasarkan priority & deadline
- Auto-reschedule ketika ada conflicts atau delays
- Time blocking otomatis dengan drag-and-drop manual override
- Meeting scheduler dengan automatic time finding
- Project management features (dependencies, templates)
- Beautiful, modern UI

**Kekurangan:**

- Harga sangat mahal ($34/month, $19/month annual – no free plan)
- Tidak ada habit tracking integration
- No behavioral learning (hanya rule-based priority)
- Tidak mempertimbangkan user energy levels
- Learning curve cukup steep
- Overkill untuk individual users

**Key Competitive Advantage:** Premium AI-powered automatic scheduling untuk high-earning professionals yang memprioritaskan time-saving di atas cost.

---

### Notion

| Atribut              | Detail                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------- |
| **Jenis Kompetitor** | Indirect Competitor                                                                           |
| **Jenis Produk**     | All-in-One Workspace (Web, Mobile, Desktop)                                                   |
| **Target Customer**  | Knowledge workers, students, creators (18–35) yang ingin centralize semua info di satu tempat |

**Kelebihan:**

- Sangat fleksibel dan customizable
- Database untuk task/habit/goals
- Template gallery dari community
- Fitur kolaborasi & sharing

**Kekurangan:**

- Tidak ada AI scheduling (hanya AI writing assistant)
- Perlu manual setup semua sistem (steep learning curve)
- Tidak ada smart notifications atau reminders berdasarkan perilaku pengguna

**Key Competitive Advantage:** Fleksibel untuk mengorganisasi berbagai macam informasi dengan customizable database dan linking.

---

## Selanjutnya

- [Metodologi SDLC & Perancangan](sdlc.md)
