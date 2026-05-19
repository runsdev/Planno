import Link from "next/link";
import { auth } from "@/auth";

// ─── Flower decoration (matches login page) ───────────────────────────────────
function Flower({
  size,
  fill,
  rotate = 0,
  className,
}: {
  size: number;
  fill: string;
  rotate?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden
    >
      <g transform={`translate(50,50) rotate(${rotate})`}>
        {[0, 90, 180, 270].map((deg) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-22"
            rx="21"
            ry="24"
            fill={fill}
            transform={`rotate(${deg})`}
          />
        ))}
        <circle cx="0" cy="0" r="14" fill="#f8f6f5" />
      </g>
    </svg>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white rounded-[14px] shadow-[0px_2px_8px_0px_rgba(33,33,33,0.08)] px-6 py-5 flex flex-col gap-3">
      <div className="w-10 h-10 rounded-[10px] bg-[#f8e5e5] flex items-center justify-center text-[#e07b72] text-xl">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold text-[#212121]">{title}</h3>
      <p className="text-[13px] font-normal text-[#6b6b6b] leading-5">{desc}</p>
    </div>
  );
}

export default async function Home() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  return (
    <div
      className="relative min-h-screen w-full bg-[#f8f6f5] overflow-x-hidden"
      style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}
    >
      {/* ── Decorative flowers ── */}
      <div className="absolute -top-20 -right-20 pointer-events-none z-0">
        <Flower size={480} fill="#fce4e4" rotate={30} />
      </div>
      <div className="absolute top-10 right-96 pointer-events-none z-0">
        <Flower size={110} fill="#d1ecf1" rotate={65} />
      </div>
      <div className="absolute -bottom-20 -left-20 pointer-events-none z-0">
        <Flower size={480} fill="#fce4e4" rotate={30} />
      </div>
      <div className="absolute bottom-10 left-96 pointer-events-none z-0">
        <Flower size={110} fill="#d1ecf1" rotate={65} />
      </div>

      {/* ── Navbar ── */}
      <header className="relative z-10 w-full flex items-center justify-between px-8 py-5 max-w-5xl mx-auto">
        <span className="text-[26px] font-bold italic text-[#5d5d5a] leading-none select-none">
          planno
        </span>
        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/planner"
              className="h-9 px-5 flex items-center rounded-full bg-[#5d5d5a] text-white text-[13px] font-semibold hover:bg-[#3d3d3a] transition-colors"
            >
              Buka Planner
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="h-9 px-5 flex items-center rounded-full border border-[rgba(93,93,90,0.3)] text-[#5d5d5a] text-[13px] font-semibold hover:bg-[rgba(93,93,90,0.07)] transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/auth/login"
                className="h-9 px-5 flex items-center rounded-full bg-[#5d5d5a] text-white text-[13px] font-semibold hover:bg-[#3d3d3a] transition-colors"
              >
                Mulai Gratis
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-24 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#4a6fa5] bg-[rgba(205,235,241,0.6)] border border-[#4a6fa5]/30 rounded-full px-4 py-1.5 mb-6">
          ✦ Ditenagai AI
        </span>
        <h1 className="text-[48px] font-bold italic text-[#5d5d5a] leading-tight mb-4">
          planno
        </h1>
        <p className="text-[22px] font-semibold text-[#212121] leading-snug mb-3">
          Rencanakan harimu lebih cerdas.
        </p>
        <p className="text-[15px] font-normal text-[#6b6b6b] leading-6 max-w-md mb-10">
          Tambah tugas dengan bahasa natural, dapatkan prioritas otomatis dari
          AI, dan mulai hari dengan briefing personal setiap pagi.
        </p>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {isAuthenticated ? (
            <Link
              href="/planner"
              className="h-11 px-8 flex items-center rounded-full bg-[#5d5d5a] text-white text-[14px] font-semibold hover:bg-[#3d3d3a] transition-colors shadow-[0px_2px_8px_0px_rgba(93,93,90,0.25)]"
            >
              Buka Planner →
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="h-11 px-8 flex items-center rounded-full bg-[#5d5d5a] text-white text-[14px] font-semibold hover:bg-[#3d3d3a] transition-colors shadow-[0px_2px_8px_0px_rgba(93,93,90,0.25)]"
              >
                Mulai Sekarang →
              </Link>
              <Link
                href="/auth/login"
                className="h-11 px-6 flex items-center rounded-full border border-[rgba(93,93,90,0.3)] text-[#5d5d5a] text-[14px] font-semibold hover:bg-[rgba(93,93,90,0.07)] transition-colors"
              >
                Masuk
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-28">
        <h2 className="text-center text-[13px] font-semibold uppercase tracking-widest text-[#5d5d5a]/50 mb-8">
          Fitur Unggulan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            icon="✦"
            title="Tambah Tugas dengan AI"
            desc="Ketik bebas seperti ngobrol — AI langsung mengenali judul, deadline, durasi, dan kategori tugas kamu."
          />
          <FeatureCard
            icon="⚡"
            title="Prioritas Otomatis"
            desc="Setiap tugas dinilai dan diklasifikasikan ke Tinggi, Sedang, atau Rendah berdasarkan urgensi dan kepentingan."
          />
          <FeatureCard
            icon="🌅"
            title="Daily Briefing Personal"
            desc="Mulai hari dengan ringkasan singkat: 3 tugas terpenting, jam produktif puncakmu, dan kalimat motivasi."
          />
          <FeatureCard
            icon="📅"
            title="Tampilan Kalender"
            desc="Lihat semua tugasmu terjadwal di kalender mingguan berdasarkan deadline — langsung dari data real."
          />
          <FeatureCard
            icon="🎯"
            title="Sesi Fokus (Pomodoro)"
            desc="Mulai sesi fokus untuk tugas tertentu dengan timer bawaan, dan lacak berapa waktu aktual yang kamu habiskan."
          />
          <FeatureCard
            icon="🔥"
            title="Streak & Progress"
            desc="Pantau progress harian dan jaga streak produktivitasmu agar tetap konsisten setiap hari."
          />
        </div>
      </section>

      {/* ── CTA bottom ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pb-28">
        <div className="bg-white rounded-[18px] shadow-[0px_4px_24px_0px_rgba(33,33,33,0.1)] px-10 py-10 max-w-lg w-full flex flex-col items-center gap-5">
          <h2 className="text-[22px] font-bold text-[#212121] leading-snug">
            Siap jadi lebih produktif?
          </h2>
          <p className="text-[14px] text-[#6b6b6b] leading-6">
            Gratis selamanya. Tidak perlu kartu kredit.
          </p>
          {isAuthenticated ? (
            <Link
              href="/planner"
              className="h-11 px-8 flex items-center rounded-full bg-[#5d5d5a] text-white text-[14px] font-semibold hover:bg-[#3d3d3a] transition-colors w-full justify-center"
            >
              Buka Planner →
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="h-11 px-8 flex items-center rounded-full bg-[#5d5d5a] text-white text-[14px] font-semibold hover:bg-[#3d3d3a] transition-colors w-full justify-center"
            >
              Mulai Sekarang — Gratis →
            </Link>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 text-center pb-8 text-[12px] text-[#5d5d5a]/40">
        © {new Date().getFullYear()} Planno. Dibuat dengan ♥
      </footer>
    </div>
  );
}
