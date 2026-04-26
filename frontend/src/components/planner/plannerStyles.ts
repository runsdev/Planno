import type { Priority, Category, CalendarEvent } from "./plannerTypes";

export const PRIORITY_META: Record<Priority, {
  badgeBg: string; badgeBorder: string; badgeText: string;
  borderLeft: string; countBg: string; countText: string;
}> = {
  Tinggi: {
    badgeBg: "bg-[#fdecea]", badgeBorder: "border-[#e07b72]", badgeText: "text-[#e07b72]",
    borderLeft: "border-l-[#f8e5e5]", countBg: "bg-[#f7f6fb]", countText: "text-[#6b6b6b]",
  },
  Sedang: {
    badgeBg: "bg-[#fdf0e0]", badgeBorder: "border-[#d4974a]", badgeText: "text-[#d4974a]",
    borderLeft: "border-l-[#def1d0]", countBg: "bg-[#f8f6f5]", countText: "text-[#5d5d5a]",
  },
  Rendah: {
    badgeBg: "bg-[rgba(222,241,208,0.6)]", badgeBorder: "border-[#6bab7e]", badgeText: "text-[#6bab7e]",
    borderLeft: "border-l-[#cbceea]", countBg: "bg-[#f8f6f5]", countText: "text-[#5d5d5a]",
  },
};

export const CATEGORY_META: Record<Category, { bg: string; text: string }> = {
  Akademik: { bg: "bg-[#f8e5e5]",             text: "text-[#e07b72]" },
  Kerja:    { bg: "bg-[#def1d0]",             text: "text-[#3d6b35]" },
  Personal: { bg: "bg-[#cbceea]",             text: "text-[#5d65b2]" },
  // Fix: Lainnya menggunakan gray eksplisit agar tidak terkena Tailwind purge
  Lainnya:  { bg: "bg-[rgba(93,93,90,0.15)]", text: "text-[#5d5d5a]" },
};

export const PRIORITY_SIDEBAR_BADGE: Record<Priority, { bg: string; border: string; text: string }> = {
  Tinggi: { bg: "bg-[#fdecea]",             border: "border border-[#e07b72]", text: "text-[#e07b72]" },
  Sedang: { bg: "bg-[#fdf0e0]",             border: "border border-[#d4974a]", text: "text-[#d4974a]" },
  Rendah: { bg: "bg-[rgba(222,241,208,0.6)]", border: "border border-[#6bab7e]", text: "text-[#6bab7e]" },
};

export const CAL_COLOR: Record<CalendarEvent["color"], {
  bg: string; border: string; titleText: string; timeText: string;
}> = {
  red:   { bg: "bg-[rgba(248,232,233,0.95)]", border: "border-l-[#e07b72]",           titleText: "text-[#5d5d5a]", timeText: "text-[#e07b72]" },
  blue:  { bg: "bg-[rgba(205,235,241,0.95)]", border: "border-l-[#4a6fa5]",           titleText: "text-[#5d5d5a]", timeText: "text-[#4a6fa5]" },
  green: { bg: "bg-[rgba(222,241,208,0.95)]", border: "border-l-[#6bab7e]",           titleText: "text-[#5d5d5a]", timeText: "text-[#6bab7e]" },
  gray:  { bg: "bg-[rgba(220,220,218,0.95)]", border: "border-l-[rgba(93,93,90,0.7)]", titleText: "text-[#5d5d5a]", timeText: "text-[#5d5d5a]" },
};