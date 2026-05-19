import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convert an ISO/datetime string from the DB to a human-readable Indonesian label. */
export function formatDeadline(deadline: string | null | undefined): string {
  if (!deadline) return "Tidak ditentukan";
  try {
    const dt = new Date(deadline.replace(" ", "T"));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dDay = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    const diffDays = Math.round(
      (dDay.getTime() - today.getTime()) / 86_400_000,
    );
    const h = dt.getHours();
    const m = dt.getMinutes();
    const timeStr =
      h !== 0 || m !== 0
        ? ` ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
        : "";
    if (diffDays < 0) return `Terlambat${timeStr}`;
    if (diffDays === 0) return `Hari ini${timeStr}`;
    if (diffDays === 1) return `Besok${timeStr}`;
    if (diffDays <= 7) return `${diffDays} hari lagi${timeStr}`;
    return dt.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return deadline;
  }
}

/** Return the deadline CSS colour class (red if today/overdue, undefined otherwise). */
export function getDeadlineColor(
  deadline: string | null | undefined,
): string | undefined {
  if (!deadline) return undefined;
  try {
    const dt = new Date(deadline.replace(" ", "T"));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dDay = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    const diffDays = Math.round(
      (dDay.getTime() - today.getTime()) / 86_400_000,
    );
    return diffDays <= 0 ? "text-[#e07b72]" : undefined;
  } catch {
    return undefined;
  }
}
