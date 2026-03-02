---
title: SDLC — Planno
---

# SDLC — Planno

[← Kembali ke Beranda](index.md)

---

## Metodologi SDLC

**Metodologi yang digunakan: Agile**

Tim memilih metodologi Agile karena beberapa alasan berikut:

- **Fleksibilitas terhadap perubahan requirement** — Planno adalah produk berbasis AI/ML di mana fitur-fitur seperti Smart Task Input, AI Prioritization, dan Energy Pattern Learning kemungkinan besar akan mengalami iterasi dan penyesuaian berdasarkan feedback pengguna. Agile sangat akomodatif terhadap perubahan ini.
- **Pengujian produk fungsional lebih awal** — Dengan pendekatan sprint (2 mingguan), tim dapat segera merilis versi fungsional minimal (MVP) sejak awal untuk diuji, sehingga mendapatkan feedback lebih cepat.
- **Tim kecil dan komunikasi intensif** — Dengan 3 anggota tim (Cloud Engineer, Project Manager & AI Engineer, Software Engineer & UI/UX Designer), struktur Scrum yang ringan dan iteratif sangat cocok untuk kolaborasi erat.
- **Kompleksitas integrasi AI** — Fitur ML seperti energy pattern learning dan procrastination detection memerlukan eksperimen iteratif. Agile memungkinkan penyesuaian model dan algoritma per sprint tanpa menghambat keseluruhan proyek.
- **Pengembangan paralel** — Anggota tim dapat mengerjakan fitur berbeda secara paralel per sprint, meningkatkan efisiensi pengembangan.

---

## Perancangan SDLC

### Tujuan Produk

1. Membantu individu memprioritaskan tugas secara optimal berdasarkan urgency dan personal working pattern.
2. Mengotomatisasi time blocking yang sesuai dengan energy level dan kebiasaan (habit) pengguna menggunakan Machine Learning.
3. Mengukur dan meningkatkan produktivitas pengguna secara data-driven melalui analytics dan actionable insights.
4. Menyediakan platform all-in-one yang mengintegrasikan task management, calendar, dan habit tracking dalam satu antarmuka yang intuitif.
5. Mendeteksi pola prokrastinasi dan memberikan notifikasi serta rekomendasi untuk membantu pengguna tetap produktif.

---

### Pengguna Potensial & Kebutuhan

| Segmen Pengguna                                    | Karakteristik                                                                                             | Kebutuhan Utama                                                                                     |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Mahasiswa & Pelajar**                            | Tech-savvy, aktif di platform digital, sering kelelahan mengatur jadwal kuliah + tugas + kegiatan         | Manajemen deadline tugas, time blocking belajar, habit tracker (tidur, olahraga)                    |
| **Pekerja Muda / Young Professionals (25–35 thn)** | Tinggal di kota besar Indonesia, multi-tasking tinggi, rentan burnout, familiar dengan productivity tools | AI prioritization tugas kerja, energy-aware scheduling, analytics produktivitas, integrasi kalender |
| **Freelancer (20–35 thn)**                         | Jadwal fleksibel, banyak klien, sulit mengatur waktu mandiri                                              | Smart rescheduling, realistic duration prediction, focus mode (Pomodoro)                            |
| **Individu dengan ADHD**                           | Kesulitan fokus dan memprioritaskan tugas, membutuhkan sistem eksternal                                   | Procrastination detection, daily briefing, notifikasi motivasional, task breakdown otomatis         |

---

### Use Case Diagram

![Use Case Diagram Planno](assets/use-case-diagram.png)

---

### Functional Requirements

| FR        | Deskripsi                                                                                                                                                                                                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **FR-1**  | User dapat melakukan registrasi dengan membuat akun baru menggunakan nama, email, dan password. Setelah akun berhasil dibuat, user dapat langsung mengakses dashboard utama untuk mulai menggunakan aplikasi.                                                          |
| **FR-2**  | User dapat masuk ke dalam aplikasi dengan memasukkan email dan password yang telah terdaftar. Setelah berhasil login, user dapat mengakses seluruh fitur yang tersedia sesuai dengan hak aksesnya.                                                                     |
| **FR-3**  | User dapat menambahkan tugas menggunakan kalimat bebas (natural language). Dari input tersebut, informasi seperti tenggat waktu, estimasi durasi, dan kategori tugas akan diproses sehingga tugas tersimpan dalam format terstruktur dan siap dianalisis lebih lanjut. |
| **FR-4**  | User dapat menambahkan tugas baru, mengedit detail tugas, menghapus tugas yang tidak diperlukan, serta menandai tugas sebagai selesai. User juga dapat memperbarui informasi seperti deadline atau durasi sesuai kebutuhan.                                            |
| **FR-5**  | User dapat melihat daftar tugas yang telah diprioritaskan berdasarkan tingkat urgensi dan kepentingannya. User juga dapat memahami klasifikasi tugas melalui tampilan seperti matriks Eisenhower untuk menentukan fokus kerja.                                         |
| **FR-6**  | User dapat melihat jadwal harian yang telah tersusun dalam bentuk blok waktu. Jadwal ini membantu user memahami kapan harus mengerjakan tugas tertentu sesuai urutan prioritas.                                                                                        |
| **FR-7**  | User dapat mencatat tingkat energi harian dalam skala tertentu (misalnya 1–5). Data ini menjadi bagian dari histori pribadi yang menggambarkan kondisi performa user setiap hari.                                                                                      |
| **FR-8**  | User dapat menambahkan kebiasaan harian seperti olahraga, tidur cukup, atau meditasi. User juga dapat mengedit, menghapus, serta menandai habit sebagai selesai untuk setiap hari.                                                                                     |
| **FR-9**  | User dapat melihat dashboard analitik yang menampilkan tingkat penyelesaian tugas, distribusi waktu kerja, pola energi, serta hubungan antara kebiasaan dan produktivitas. Informasi ini membantu user memahami performanya secara objektif.                           |
| **FR-10** | User dapat mengaktifkan Focus Mode untuk menjalankan sesi kerja berbasis teknik Pomodoro. User dapat bekerja dalam interval waktu tertentu dengan jeda istirahat terjadwal untuk menjaga konsentrasi.                                                                  |
| **FR-11** | User dapat menerima ringkasan harian setiap pagi yang berisi tiga tugas prioritas utama beserta saran pembagian waktu pengerjaannya. Ringkasan ini membantu user memulai hari dengan rencana yang jelas.                                                               |
| **FR-12** | AI menganalisis data tugas yang dimasukkan user, termasuk tenggat waktu, estimasi durasi, tingkat kepentingan, serta histori penyelesaian tugas sebelumnya. Hasil analisis ini menjadi dasar dalam menentukan tingkat prioritas.                                       |
| **FR-13** | AI mengklasifikasikan tugas berdasarkan tingkat urgensi dan kepentingannya, kemudian menghasilkan priority score yang mengurutkan tugas dari yang paling mendesak hingga yang dapat ditunda.                                                                           |
| **FR-14** | AI menyusun jadwal harian dengan mengalokasikan tugas ke dalam slot waktu yang tersedia. Penyusunan ini mempertimbangkan prioritas tugas, estimasi durasi, serta pola energi user agar jadwal lebih realistis dan optimal.                                             |
| **FR-15** | AI mempelajari histori pencatatan energi user untuk mengidentifikasi jam-jam dengan performa tertinggi. Informasi ini digunakan untuk menyesuaikan penempatan tugas berat pada periode energi puncak.                                                                  |
| **FR-16** | AI menganalisis hubungan antara kebiasaan harian user dengan tingkat produktivitasnya. Dari analisis tersebut, AI menghasilkan insight yang menunjukkan bagaimana habit tertentu memengaruhi performa kerja.                                                           |
| **FR-17** | AI membandingkan estimasi waktu yang diberikan user dengan durasi pengerjaan aktual. Berdasarkan perbandingan tersebut, AI memperbarui prediksi durasi untuk tugas serupa di masa depan agar lebih akurat.                                                             |
| **FR-18** | AI mendeteksi pola penundaan dengan mengidentifikasi tugas yang sering dijadwalkan ulang atau melewati tenggat waktu. Jika pola procrastination terdeteksi, AI memberikan saran atau rekomendasi untuk membantu user menyelesaikan tugas.                              |
| **FR-19** | AI menyesuaikan ulang jadwal apabila terjadi keterlambatan atau muncul tugas mendesak baru. Proses penjadwalan ulang dilakukan dengan tetap mempertahankan prioritas utama dan meminimalkan gangguan terhadap rencana awal.                                            |
| **FR-20** | AI memilih tiga tugas paling berdampak untuk dikerjakan pada hari tersebut dan menyusunnya dalam urutan optimal berdasarkan prioritas dan pola energi user.                                                                                                            |
