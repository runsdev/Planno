"use client";

interface FocusSessionDotsProps {
  completedSessions: number; // total sesi fokus yang sudah selesai
}

export function FocusSessionDots({ completedSessions }: FocusSessionDotsProps) {
  // Tampilkan maksimal 8 dot, lebih dari itu tampilkan angka
  const MAX_DOTS = 8;
  const displayDots = Math.min(completedSessions, MAX_DOTS);

  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-medium text-[#5d5d5a]/60">
        {completedSessions === 0
          ? "Belum ada sesi selesai"
          : `${completedSessions} sesi fokus selesai`}
      </span>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: displayDots }, (_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-[#e07b72] transition-all duration-300"
          />
        ))}
        {completedSessions > MAX_DOTS && (
          <span className="text-[10px] font-semibold text-[#e07b72]">
            +{completedSessions - MAX_DOTS}
          </span>
        )}
      </div>
    </div>
  );
}