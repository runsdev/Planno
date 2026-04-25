"use client";

import { useState } from "react";
import { Kanban, User } from "lucide-react";

// ─── Decorative flower ────────────────────────────────────────────────────────
function Flower({
  size,
  fill,
  className,
}: {
  size: number;
  fill: string;
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
      <g transform="translate(50,50)">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-22"
            rx="14"
            ry="22"
            fill={fill}
            transform={`rotate(${deg})`}
          />
        ))}
        <circle cx="0" cy="0" r="14" fill="white" />
      </g>
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ProductiveTime =
  | "7-10 pagi"
  | "10-14 siang"
  | "14-18 siang"
  | "18-22 malam";
type WorkStyle = "Deep focus" | "Multitasking" | "Bergantian";

// ─── Sub-components ───────────────────────────────────────────────────────────
function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-[33px] px-[14px] rounded-[10.5px] border border-[rgba(33,33,33,0.1)] text-[12.25px] font-normal text-[#212121] transition-colors cursor-pointer whitespace-nowrap
        ${active ? "bg-[#d8dfe9]" : "bg-[#f7f6fb] hover:bg-[#edeef5]"}`}
    >
      {label}
    </button>
  );
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10.5px] font-semibold text-[#6b6b6b] leading-[14px]">
      {children}
    </p>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [productiveTime, setProductiveTime] =
    useState<ProductiveTime>("7-10 pagi");
  const [workStyle, setWorkStyle] = useState<WorkStyle>("Bergantian");
  const [activeFrom, setActiveFrom] = useState("");
  const [activeTo, setActiveTo] = useState("");

  const productiveTimes: ProductiveTime[] = [
    "7-10 pagi",
    "10-14 siang",
    "14-18 siang",
    "18-22 malam",
  ];
  const workStyles: WorkStyle[] = ["Deep focus", "Multitasking", "Bergantian"];

  return (
    <div
      className="relative min-h-screen bg-[#f8f6f5] overflow-hidden"
      style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}
    >
      {/* ── Decorative flowers (bottom) ── */}
      <div className="absolute bottom-[-60px] left-[-60px] pointer-events-none">
        <Flower size={260} fill="#f5d4d0" />
      </div>
      <div className="absolute bottom-[100px] left-[200px] pointer-events-none">
        <Flower size={90} fill="#b8dde8" />
      </div>
      <div className="absolute bottom-[80px] right-[340px] pointer-events-none">
        <Flower size={70} fill="#b8dde8" />
      </div>
      <div className="absolute bottom-[40px] right-[160px] pointer-events-none">
        <Flower size={110} fill="#d4e8d4" />
      </div>
      <div className="absolute bottom-[-30px] right-[-30px] pointer-events-none">
        <Flower size={200} fill="#d4e8d4" />
      </div>

      {/* ── Navbar ── */}
      <header className="h-[50px] bg-[#f8f6f5] border-b border-[rgba(93,93,90,0.7)] flex items-center px-6 shrink-0 gap-4">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative flex items-center justify-center w-[26px] h-[26px]">
            <div className="absolute inset-0 rounded-[15px] bg-[#5d5d5a]/10" />
            <Kanban className="w-4 h-4 text-[#5d5d5a] relative z-10" />
          </div>
          <span className="text-[18px] font-bold italic text-[#5d5d5a]">
            planno
          </span>
        </div>
        <div className="flex-1" />
        <button className="flex items-center justify-center cursor-pointer">
          <User className="w-[26px] h-[26px] text-[#5d5d5a]" />
        </button>
      </header>

      {/* ── Page body ── */}
      <div className="px-6 pt-[18px] pb-12 relative z-10">
        {/* Filter pill + heading row */}
        <div className="flex items-center gap-4 mb-[18px]">
          <button className="h-[26.5px] px-[11.5px] rounded-full bg-[#5d5d5a] border border-[rgba(93,93,90,0.7)] text-[10.5px] font-semibold text-[#f8f6f5] cursor-pointer whitespace-nowrap">
            Semua
          </button>
          <h2 className="text-[18px] font-semibold text-[#5d5d5a] capitalize tracking-[0.84px]">
            Profil
          </h2>
        </div>

        {/* ── Profile card ── */}
        <div className="bg-white rounded-[14.5px] shadow-[0px_1px_4px_0px_rgba(33,33,33,0.08)] px-[21px] py-[21px] mb-6 max-w-[882px]">
          <div className="flex gap-[10px] flex-wrap">
            {/* Name field */}
            <div className="flex flex-col gap-[7px] flex-1 min-w-[200px]">
              <FormLabel>Nama</FormLabel>
              <input
                type="text"
                defaultValue="Vania Aprilia"
                className="h-[40px] px-[14px] bg-white border border-[rgba(33,33,33,0.1)] rounded-[10.5px] text-[12.25px] font-normal text-[#212121] outline-none focus:border-[rgba(93,93,90,0.5)] w-full"
              />
            </div>
            {/* Email field */}
            <div className="flex flex-col gap-[7px] flex-1 min-w-[200px]">
              <FormLabel>Email</FormLabel>
              <input
                type="email"
                defaultValue="vania@gmail.com"
                disabled
                className="h-[40px] px-[14px] bg-[#f7f6fb] border border-[rgba(33,33,33,0.1)] rounded-[10.5px] text-[12.25px] font-normal text-[#6b6b6b] outline-none w-full cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* ── AI Preferences heading ── */}
        <div className="mb-[18px] max-w-[882px]">
          <h2 className="text-[18px] font-semibold text-[#5d5d5a] capitalize tracking-[0.84px] mb-[6px]">
            Preferensi AI
          </h2>
          <p className="text-[16px] font-normal text-[#6b6b6b]">
            Bantu AI memahami cara kerjamu
          </p>
        </div>

        {/* ── AI Preferences card ── */}
        <div className="bg-white rounded-[14.5px] shadow-[0px_1px_4px_0px_rgba(33,33,33,0.08)] px-[21px] py-[21px] max-w-[882px] flex flex-col gap-[28px]">
          {/* Paling produktif */}
          <div className="flex flex-col gap-[10.5px]">
            <p className="text-[16px] font-semibold text-[#6b6b6b] leading-[14px]">
              Paling produktif
            </p>
            <div className="flex flex-wrap gap-[10.5px]">
              {productiveTimes.map((t) => (
                <ToggleChip
                  key={t}
                  label={t}
                  active={productiveTime === t}
                  onClick={() => setProductiveTime(t)}
                />
              ))}
            </div>
          </div>

          {/* Gaya kerja */}
          <div className="flex flex-col gap-[10.5px]">
            <p className="text-[16px] font-semibold text-[#6b6b6b] leading-[14px]">
              Gaya kerja
            </p>
            <div className="flex flex-wrap gap-[10.5px]">
              {workStyles.map((s) => (
                <ToggleChip
                  key={s}
                  label={s}
                  active={workStyle === s}
                  onClick={() => setWorkStyle(s)}
                />
              ))}
            </div>
          </div>

          {/* Jam aktif */}
          <div className="flex flex-col gap-[10.5px]">
            <p className="text-[16px] font-semibold text-[#6b6b6b] leading-[14px]">
              Jam aktif
            </p>
            <div className="flex items-center gap-[10.5px]">
              <input
                type="time"
                value={activeFrom}
                onChange={(e) => setActiveFrom(e.target.value)}
                className="flex-1 h-[41.5px] px-[14px] bg-white border border-[rgba(33,33,33,0.1)] rounded-[10.5px] text-[12.25px] font-normal text-[#212121] outline-none focus:border-[rgba(93,93,90,0.5)]"
              />
              <span className="text-[14px] font-normal text-[#6b6b6b] whitespace-nowrap">
                s/d
              </span>
              <input
                type="time"
                value={activeTo}
                onChange={(e) => setActiveTo(e.target.value)}
                className="flex-1 h-[41.5px] px-[14px] bg-white border border-[rgba(33,33,33,0.1)] rounded-[10.5px] text-[12.25px] font-normal text-[#212121] outline-none focus:border-[rgba(93,93,90,0.5)]"
              />
            </div>
          </div>

          {/* Save button */}
          <div>
            <button className="h-[31.5px] px-[18px] bg-[#d8dfe9] rounded-[10.5px] text-[12.25px] font-semibold text-[#212121] hover:bg-[#c5cedd] transition-colors cursor-pointer">
              Simpan Preferensi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
