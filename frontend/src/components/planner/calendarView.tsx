// Planno/frontend/src/components/planner/calendarView.tsx
"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, X, Clock, Flag, Pencil, Trash2, Tag } from "lucide-react";
import { CAL_COLOR, CATEGORY_META, PRIORITY_SIDEBAR_BADGE } from "./plannerStyles";
import {
  CAL_START,
  CAL_END,
  HOUR_H,
  GRID_TOP,
  TIME_COL_W,
  CalendarEvent,
  Task,
  Category,
} from "./plannerTypes";
import { formatDeadline } from "@/lib/utils";
import { EditTaskModal } from "../add-task/editTaskModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toTimeStr(hour: number) {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getTimePx(hour: number) {
  return (hour - CAL_START) * HOUR_H + GRID_TOP;
}

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildWeekDays(monday: Date) {
  const SHORT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const MONTH_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      short: SHORT[i],
      dateNum: String(d.getDate()),
      month: MONTH_ID[d.getMonth()],
      year: d.getFullYear(),
      full: new Date(d),
    };
  });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const CATEGORY_COLOR: Record<Category, CalendarEvent["color"]> = {
  Akademik: "red",
  Kerja: "blue",
  Personal: "green",
  Lainnya: "gray",
};

function parseDurationHours(duration: string): number {
  const jamMatch = duration.match(/(\d+)\s*jam/);
  const mntMatch = duration.match(/(\d+)\s*mnt/);
  const hours = jamMatch ? parseInt(jamMatch[1]) : 0;
  const mins = mntMatch ? parseInt(mntMatch[1]) : 0;
  return hours + mins / 60 || 1;
}

function tasksToEvents(tasks: Task[], displayMonday: Date): CalendarEvent[] {
  const mondayMs = new Date(
    displayMonday.getFullYear(),
    displayMonday.getMonth(),
    displayMonday.getDate(),
  ).getTime();

  return tasks
    .filter((t) => t.deadline && !t.completed)
    .flatMap((task) => {
      const dt = new Date(task.deadline!);
      const taskDayMs = new Date(
        dt.getFullYear(),
        dt.getMonth(),
        dt.getDate(),
      ).getTime();
      const dayIndex = Math.round((taskDayMs - mondayMs) / 86_400_000);
      if (dayIndex < 0 || dayIndex > 6) return [];

      const deadlineHour = dt.getHours() + dt.getMinutes() / 60;
      const durationH = parseDurationHours(task.duration);

      let startHour: number, endHour: number;
      if (deadlineHour === 0) {
        startHour = 9;
        endHour = 9 + durationH;
      } else {
        endHour = deadlineHour;
        startHour = Math.max(endHour - durationH, CAL_START);
      }

      return [
        {
          id: task.id,
          title: task.title,
          startHour,
          endHour,
          dayIndex,
          color: CATEGORY_COLOR[task.category],
          deadline: formatDeadline(task.deadline),
          hasAI: true,
        } satisfies CalendarEvent,
      ];
    });
}

function AISmallBadge() {
  return (
    <span className="inline-flex items-center gap-0.75 text-[10px] font-semibold text-[#4a6fa5] bg-[rgba(205,235,241,0.8)] border border-[#4a6fa5] rounded-full px-1.5 py-px whitespace-nowrap leading-none">
      ✦ AI
    </span>
  );
}

// ─── Event card ───────────────────────────────────────────────────────────────
function CalendarEventCard({
  event,
  colWidth = 1,
  colIndex = 0,
  onClick,
}: {
  event: CalendarEvent;
  colWidth?: number;
  colIndex?: number;
  onClick: () => void;
}) {
  const c         = CAL_COLOR[event.color];
  const top       = getTimePx(event.startHour);
  const height    = Math.max((event.endHour - event.startHour) * HOUR_H, 22);
  const isShort   = height < 44;
  const timeLabel = `${toTimeStr(event.startHour)} – ${toTimeStr(event.endHour)}`;
  const widthPct  = 100 / colWidth;
  const leftPct   = widthPct * colIndex;

  return (
    <div
      onClick={onClick}
      className={`absolute rounded-[10.5px] shadow-[0px_1px_4px_0px_rgba(33,33,33,0.08)] border-l-4 ${c.bg} ${c.border} overflow-hidden cursor-pointer hover:brightness-[0.95] active:scale-[0.99] transition-all z-10`}
      style={{
        top,
        height,
        left  : `calc(${leftPct}% + 2px)`,
        width : `calc(${widthPct}% - 4px)`,
      }}
    >
      {isShort ? (
        <div className="flex items-center gap-1 px-2 h-full">
          <p className={`text-[11px] font-semibold ${c.titleText} truncate flex-1`}>
            {event.title}
          </p>
          {event.hasAI && <AISmallBadge />}
        </div>
      ) : (
        <div className="px-2 py-1.5 flex flex-col gap-0.5 h-full overflow-hidden">
          <div className="flex items-start justify-between gap-1">
            <p className={`text-[12px] font-semibold ${c.titleText} leading-3.75 line-clamp-2 flex-1`}>
              {event.title}
            </p>
            {event.hasAI && (
              <div className="shrink-0">
                <AISmallBadge />
              </div>
            )}
          </div>
          <p className={`text-[10px] font-normal ${c.timeText}`}>{timeLabel}</p>
          {event.deadline && (
            <p className={`text-[10px] font-normal ${c.timeText}`}>
              {event.deadline}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function NoTimePill({
  event,
  color,
  onClick,
}: {
  event: CalendarEvent;
  color: (typeof CAL_COLOR)[CalendarEvent["color"]];
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`text-[10px] font-semibold ${color.bg} ${color.border} border-l-2 rounded-r-full px-2 py-0.5 truncate cursor-pointer hover:brightness-[0.95] active:scale-[0.98] transition-all`}
    >
      {event.title}
    </div>
  );
}

function groupOverlappingEvents(events: CalendarEvent[]): CalendarEvent[][] {
  if (events.length === 0) return [];
  const sorted = [...events].sort((a, b) => a.startHour - b.startHour);
  const groups: CalendarEvent[][] = [];

  for (const event of sorted) {
    const targetGroup = groups.find((g) =>
      g.some((e) => e.startHour < event.endHour && e.endHour > event.startHour)
    );
    if (targetGroup) {
      targetGroup.push(event);
    } else {
      groups.push([event]);
    }
  }
  return groups;
}

// ─── Chip style maps ──────────────────────────────────────────────────────────
const PRIORITY_CHIP: Record<string, { bg: string; text: string; border: string }> = {
  Tinggi: { bg: "bg-[#fdecea]",               text: "text-[#e07b72]", border: "border-[#e07b72]" },
  Sedang: { bg: "bg-[#fdf0e0]",               text: "text-[#d4974a]", border: "border-[#d4974a]" },
  Rendah: { bg: "bg-[rgba(222,241,208,0.6)]", text: "text-[#6bab7e]", border: "border-[#6bab7e]" },
};

const CATEGORY_CHIP: Record<string, { bg: string; text: string }> = {
  Akademik: { bg: "bg-[#f8e5e5]",             text: "text-[#e07b72]" },
  Kerja:    { bg: "bg-[#def1d0]",             text: "text-[#3d6b35]" },
  Personal: { bg: "bg-[#cbceea]",             text: "text-[#5d65b2]" },
  Lainnya:  { bg: "bg-[rgba(93,93,90,0.15)]", text: "text-[#5d5d5a]" },
};

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
interface DeleteConfirmModalProps {
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmModal({ taskTitle, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
      onMouseDown={(e) => { if (e.currentTarget === e.target) onCancel(); }}
    >
      <div
        className="bg-white rounded-[18px] shadow-[0px_8px_32px_0px_rgba(33,33,33,0.16)] w-full max-w-sm mx-4 p-6 flex flex-col items-center gap-4"
        style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}
      >
        <div className="w-10 h-10 rounded-full bg-[#fdecea] flex items-center justify-center">
          <Trash2 className="w-5 h-5 text-[#e07b72]" />
        </div>

        <div className="flex flex-col gap-1 text-center">
          <h3 className="text-[16px] font-semibold text-[#212121]">Hapus Task?</h3>
          <p className="text-[13px] text-[#5d5d5a]">
            <span className="font-semibold">"{taskTitle}"</span> akan dihapus
            permanen dan tidak bisa dikembalikan.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-1 w-full">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 px-5 rounded-[10.5px] text-[13px] font-semibold bg-[rgba(93,93,90,0.1)] text-[#5d5d5a] hover:bg-[rgba(93,93,90,0.18)] transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-9 px-5 rounded-[10.5px] text-[13px] font-semibold bg-[#e07b72] text-white hover:bg-[#d06b62] transition-all cursor-pointer"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Calendar Task Detail Modal ───────────────────────────────────────────────
interface CalendarTaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function CalendarTaskDetailModal({ task, onClose, onEdit, onDelete }: CalendarTaskDetailModalProps) {
  const priorityChip = PRIORITY_CHIP[task.priority] ?? PRIORITY_CHIP["Rendah"];
  const categoryChip = CATEGORY_CHIP[task.category] ?? CATEGORY_CHIP["Lainnya"];
  const deadlineText = formatDeadline(task.deadline);
  const isUrgent = deadlineText.includes("Hari ini") || deadlineText.includes("Terlambat");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
      onMouseDown={(e) => { if (e.currentTarget === e.target) onClose(); }}
    >
      <div
        className="bg-white rounded-[18px] shadow-[0px_8px_32px_0px_rgba(33,33,33,0.16)] w-full max-w-sm mx-4 overflow-hidden"
        style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <span
              className={`self-start px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold border
                ${priorityChip.bg} ${priorityChip.text} ${priorityChip.border}`}
            >
              {task.priority}
            </span>
            <h3 className="text-[17px] font-semibold text-[#212121] leading-snug">
              {task.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-[#5d5d5a]/40 hover:bg-[#5d5d5a]/10 transition-colors cursor-pointer mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="h-px bg-[rgba(93,93,90,0.1)] mx-5" />

        {/* Detail rows */}
        <div className="px-5 py-4 flex flex-col gap-3">
          {/* Deadline */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[8px] bg-[#f8f6f5] flex items-center justify-center shrink-0">
              <Flag className={`w-3.5 h-3.5 ${isUrgent ? "text-[#e07b72]" : "text-[#5d5d5a]/50"}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-[#5d5d5a]/40 uppercase tracking-wide">Deadline</span>
              <span className={`text-[12.5px] font-semibold ${isUrgent ? "text-[#e07b72]" : "text-[#5d5d5a]"}`}>
                {deadlineText}
              </span>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[8px] bg-[#f8f6f5] flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 text-[#5d5d5a]/50" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-[#5d5d5a]/40 uppercase tracking-wide">Durasi</span>
              <span className="text-[12.5px] font-semibold text-[#5d5d5a]">{task.duration}</span>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[8px] bg-[#f8f6f5] flex items-center justify-center shrink-0">
              <Tag className="w-3.5 h-3.5 text-[#5d5d5a]/50" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-[#5d5d5a]/40 uppercase tracking-wide">Kategori</span>
              <span
                className={`self-start mt-0.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold
                  ${categoryChip.bg} ${categoryChip.text}`}
              >
                {task.category}
              </span>
            </div>
          </div>

          {/* AI badge */}
          <div className="flex items-center gap-1.5 mt-1 px-0.5">
            <span className="text-[10.5px] font-semibold text-[#4a6fa5] bg-[rgba(205,235,241,0.8)] border border-[#4a6fa5] rounded-full px-2 py-px">
              ✦ AI Scheduled
            </span>
          </div>
        </div>

        <div className="h-px bg-[rgba(93,93,90,0.1)] mx-5" />

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-[10.5px] text-[12.5px] font-semibold text-[#e07b72] hover:bg-[#fdecea] transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-[10.5px] text-[12.5px] font-medium text-[#5d5d5a] hover:bg-[rgba(93,93,90,0.1)] transition-all cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-1.5 h-9 px-4 rounded-[10.5px] text-[12.5px] font-semibold bg-[#4a4a47] text-[#f8f6f5] hover:bg-[#333331] transition-all cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Calendar View Component ─────────────────────────────────────────────
interface CalendarViewProps {
  tasks: Task[];
  onUpdateTask?: (id: string, updated: Partial<Task>) => void;
  onDeleteTask?: (id: string) => void;
}

export function CalendarView({ tasks, onUpdateTask, onDeleteTask }: CalendarViewProps) {
  const today = new Date();
  const todayMonday = useMemo(() => getMondayOf(new Date()), []);

  const [weekOffset, setWeekOffset] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedTask,   setSelectedTask]   = useState<Task | null>(null);
  const [isDetailOpen,   setIsDetailOpen]   = useState(false);
  const [isEditOpen,     setIsEditOpen]     = useState(false);
  const [isDeletingOpen, setIsDeletingOpen] = useState(false);

  const displayMonday = useMemo(() => {
    return new Date(
      todayMonday.getFullYear(),
      todayMonday.getMonth(),
      todayMonday.getDate() + weekOffset * 7,
    );
  }, [todayMonday, weekOffset]);

  const weekDays = buildWeekDays(displayMonday);

  const firstDay = weekDays[0].full;
  const lastDay = weekDays[6].full;
  const MONTH_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const headerLabel =
    firstDay.getMonth() === lastDay.getMonth()
      ? `${MONTH_ID[firstDay.getMonth()]} ${firstDay.getFullYear()}`
      : `${MONTH_ID[firstDay.getMonth()]} – ${MONTH_ID[lastDay.getMonth()]} ${lastDay.getFullYear()}`;

  const todayVisible = weekOffset === 0;

  const hours = Array.from({ length: CAL_END - CAL_START }, (_, i) => CAL_START + i);
  const totalH = hours.length * HOUR_H + GRID_TOP;

  const allEvents = tasksToEvents(tasks, displayMonday);

  const timedEvents = allEvents.filter((e) => {
    const task = tasks.find((t) => t.id === e.id);
    if (!task?.deadline) return true;
    const dt = new Date(task.deadline);
    return dt.getHours() !== 0 || dt.getMinutes() !== 0;
  });
  const noTimeEvents = allEvents.filter((e) => !timedEvents.includes(e));

  const [currentTimePx, setCurrentTimePx] = useState<number | null>(null);
  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const h = now.getHours() + now.getMinutes() / 60;
      setCurrentTimePx(h >= CAL_START && h <= CAL_END ? getTimePx(h) : null);
    };
    calc();
    const id = setInterval(calc, 60_000);
    return () => clearInterval(id);
  }, []);

  const scrollToNow = useCallback(() => {
    if (!scrollRef.current) return;
    const now = new Date();
    const h = now.getHours() + now.getMinutes() / 60;
    const px = getTimePx(Math.max(h, CAL_START));
    scrollRef.current.scrollTop = Math.max(px - 120, 0);
  }, []);

  useEffect(() => {
    scrollToNow();
  }, [scrollToNow]);

  const goToToday = () => {
    setWeekOffset(0);
    setTimeout(scrollToNow, 0);
  };

  // ── Modal handlers ──────────────────────────────────────────────────────────
  const handleTaskClick = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsDetailOpen(true);
    }
  };

  const handleEditClick = () => {
    setIsDetailOpen(false);
    setIsEditOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDetailOpen(false);
    setIsDeletingOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedTask) {
      onDeleteTask?.(selectedTask.id);
    }
    setIsDeletingOpen(false);
    setSelectedTask(null);
  };

  const handleSaveEdit = (updated: Partial<Task>) => {
    if (selectedTask) {
      onUpdateTask?.(selectedTask.id, updated);
    }
    setIsEditOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="shrink-0 flex items-center gap-3 px-6 py-2.5 border-b border-[rgba(93,93,90,0.15)] bg-[#f8f6f5]">
        <span className="text-[15px] font-semibold text-[#5d5d5a] min-w-30">
          {headerLabel}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-[8px] text-[#5d5d5a]/60 hover:bg-[#5d5d5a]/10 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-[8px] text-[#5d5d5a]/60 hover:bg-[#5d5d5a]/10 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={goToToday}
          disabled={todayVisible}
          className={`h-[26.5px] px-3 rounded-full border text-[10.5px] font-semibold transition-colors
            ${
              todayVisible
                ? "border-[rgba(93,93,90,0.2)] text-[#5d5d5a]/30 cursor-default"
                : "border-[rgba(93,93,90,0.4)] text-[#5d5d5a] hover:bg-[#5d5d5a]/5 cursor-pointer"
            }`}
        >
          Hari Ini
        </button>
      </div>

      {/* ── Day headers ── */}
      <div className="shrink-0 flex border-b border-[rgba(93,93,90,0.15)] bg-[#f8f6f5]">
        <div style={{ width: TIME_COL_W }} className="shrink-0" />
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day.full, today);
          const dayNoTimeEvents = noTimeEvents.filter((e) => e.dayIndex === i);
          return (
            <div
              key={i}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 border-r border-[rgba(93,93,90,0.1)] last:border-r-0 ${isToday ? "bg-white" : ""}`}
            >
              <span className={`text-[10.5px] font-medium uppercase tracking-wide ${isToday ? "text-[#4a6fa5]" : "text-[#5d5d5a]/50"}`}>
                {day.short}
              </span>
              <div className={`w-7 h-7 flex items-center justify-center rounded-full text-[14px] font-semibold transition-colors ${isToday ? "bg-[#4a6fa5] text-white" : "text-[#5d5d5a]"}`}>
                {day.dateNum}
              </div>
              {dayNoTimeEvents.length > 0 && (
                <div className="w-full px-1 flex flex-col gap-0.5 mt-0.5">
                  {dayNoTimeEvents.map((e) => (
                    <NoTimePill
                      key={e.id}
                      event={e}
                      color={CAL_COLOR[e.color]}
                      onClick={() => handleTaskClick(`${e.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Scrollable grid ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="flex" style={{ height: totalH }}>
          {/* Time labels */}
          <div className="shrink-0 relative" style={{ width: TIME_COL_W, height: totalH }}>
            {hours.map((h, i) => (
              <div
                key={h}
                className="absolute right-3 text-[10.5px] font-medium text-[#5d5d5a]/40 text-right -translate-y-1/2 select-none"
                style={{ top: i * HOUR_H + GRID_TOP }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIdx) => {
            const isToday = isSameDay(day.full, today);
            const dayEvents = timedEvents.filter((e) => e.dayIndex === dayIdx);

            return (
              <div
                key={dayIdx}
                className={`flex-1 relative border-r border-[rgba(93,93,90,0.1)] last:border-r-0 ${isToday ? "bg-white" : ""}`}
                style={{ height: totalH }}
              >
                {hours.map((_, i) => (
                  <div key={`h-${i}`} className="absolute left-0 right-0 border-t border-[rgba(93,93,90,0.08)]" style={{ top: i * HOUR_H + GRID_TOP }} />
                ))}
                {hours.map((_, i) => (
                  <div key={`hh-${i}`} className="absolute left-0 right-0 border-t border-dashed border-[rgba(93,93,90,0.04)]" style={{ top: i * HOUR_H + HOUR_H / 2 + GRID_TOP }} />
                ))}

                {isToday && currentTimePx !== null && (
                  <div className="absolute left-0 right-0 z-20 pointer-events-none flex items-center" style={{ top: currentTimePx }}>
                    <div className="w-2 h-2 rounded-full bg-[#e07b72] shrink-0 -ml-1" />
                    <div className="flex-1 h-px bg-[#e07b72]" />
                  </div>
                )}

                {groupOverlappingEvents(dayEvents).flatMap((group) =>
                  group.map((e, idx) => (
                    <CalendarEventCard
                      key={e.id}
                      event={e}
                      colWidth={group.length}
                      colIndex={idx}
                      onClick={() => handleTaskClick(`${e.id}`)}
                    />
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Modal stack ── */}

      {/* 1. Detail modal */}
      {isDetailOpen && selectedTask && (
        <CalendarTaskDetailModal
          task={selectedTask}
          onClose={() => { setIsDetailOpen(false); setSelectedTask(null); }}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      {/* 2. Edit modal */}
      {isEditOpen && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          open={isEditOpen}
          onClose={() => { setIsEditOpen(false); setSelectedTask(null); }}
          onSave={handleSaveEdit}
        />
      )}

      {/* 3. Delete confirmation modal */}
      {isDeletingOpen && selectedTask && (
        <DeleteConfirmModal
          taskTitle={selectedTask.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => { setIsDeletingOpen(false); setSelectedTask(null); }}
        />
      )}
    </div>
  );
}