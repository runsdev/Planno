// frontend/src/components/add-task/validateTaskInput.ts

const KATA_KERJA = [
    "kerjakan", "buat", "selesaikan", "submit", "kumpulkan", "kirim",
    "rapat", "meeting", "kuliah", "presentasi", "ujian", "diskusi",
    "makan", "olahraga", "latihan", "belajar", "review", "revisi",
    "ikut", "hadiri", "pergi", "temui", "hubungi", "telpon", "zoom",
    "interview", "konsultasi", "periksa", "cek", "urus", "bayar",
    "daftar", "ambil", "antar", "jemput", "belanja", "masak",
    "sidang", "praktikum", "les", "bimbingan", "seminar", "workshop",
    "main", "kumpul", "nongkrong", "hangout", "servis", "bayar",
    "cuci", "setrika", "bersih", "rapikan", "perbaiki", "ganti",
    "update", "backup", "restore", "install", "uninstall", "konfigurasi",
    "program", "coding", "debug", "test", "deploy", "design", "gambar",
    "tulis", "baca", "riset", "analisis", "evaluasi", "lapor",
    "catat", "ingat", "ingatkan", "reminder", "alarm", "notifikasi",
  ];
  
  const KATA_WAKTU = [
    "hari ini", "besok", "lusa", "minggu", "senin", "selasa", "rabu",
    "kamis", "jumat", "sabtu", "minggu depan", "pekan depan",
    "januari", "februari", "maret", "april", "mei", "juni",
    "juli", "agustus", "september", "oktober", "november", "desember",
    "jam", "pukul", "pk", "siang", "malam", "pagi", "sore",
    "tanggal", "tgl", "nanti", "menit", "detik", "subuh", "tengah malam",
    "minggu ini", "bulan ini", "tahun ini", "pekan ini",
  ];
  
  export function validateTaskInput(input: string): string | null {
    const text = input.trim().toLowerCase();
  
    // Terlalu pendek
    if (text.length < 5) {
      return "Input terlalu pendek. Coba masukkan aktivitas lengkap, contoh: 'kerjakan laporan besok jam 14.00'";
    }
  
    const words = text.split(/\s+/);
  
    // Kurang dari 3 kata
    if (words.length < 3) {
      return "Input tidak lengkap. Sertakan aktivitas, waktu, dan durasi. Contoh: 'rapat kelompok jumat jam 14 sampai 16'";
    }
  
    const hasKataKerja = KATA_KERJA.some((k) => text.includes(k));
    const hasKataWaktu = KATA_WAKTU.some((k) => text.includes(k));
  
    // Ada kata kerja tapi tidak ada waktu
    if (hasKataKerja && !hasKataWaktu) {
      return "Kapan aktivitas ini? Tambahkan hari atau jam, contoh: 'kerjakan laporan besok jam 14.00'";
    }
  
    // Tidak ada kata kerja dan tidak ada waktu = input tidak relevan
    if (!hasKataKerja && !hasKataWaktu) {
      return "Input tidak dikenali sebagai tugas atau aktivitas. Coba masukkan aktivitas yang ingin kamu catat, contoh: 'main sama teman besok jam 14.00'";
    }
  
    return null; // valid
  }