"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CAL_COLOR } from "./plannerStyles";
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toTimeStr(hour: number) {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getTimePx(hour: number) {
  return (hour - CAL_START) * HOUR_H + GRID_TOP;
}

/** Returns the Monday of the week containing `date` */
function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun…6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Builds 7-day label array starting from a Monday */
function buildWeekDays(monday: Date) {
  const SHORT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const MONTH_ID = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
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

// ─── Task → CalendarEvent conversion ─────────────────────────────────────────
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
        // No specific time — schedule at 09:00
        startHour = 9;
        endHour = 9 + durationH;
      } else {
        // Work block ending at deadline
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

// ─── AI badge ─────────────────────────────────────────────────────────────────
function AISmallBadge() {
  return (
    <span className="inline-flex items-center gap-0.75 text-[10px] font-semibold text-[#4a6fa5] bg-[rgba(205,235,241,0.8)] border border-[#4a6fa5] rounded-full px-1.5 py-px whitespace-nowrap leading-none">
      ✦ AI
    </span>
  );
}

// ─── Event card ───────────────────────────────────────────────────────────────
function CalendarEventCard({ event }: { event: CalendarEvent }) {
  const c = CAL_COLOR[event.color];
  const top = getTimePx(event.startHour);
  const height = Math.max((event.endHour - event.startHour) * HOUR_H, 22);
  const isShort = height < 44;
  const timeLabel = `${toTimeStr(event.startHour)} – ${toTimeStr(event.endHour)}`;

  return (
    <div
      className={`absolute left-1 right-1 rounded-[10.5px] shadow-[0px_1px_4px_0px_rgba(33,33,33,0.08)] border-l-4 ${c.bg} ${c.border} overflow-hidden cursor-pointer hover:brightness-[0.97] transition-all`}
      style={{ top, height }}
    >
      {isShort ? (
        <div className="flex items-center gap-1 px-2 h-full">
          <p
            className={`text-[11px] font-semibold ${c.titleText} truncate flex-1`}
          >
            {event.title}
          </p>
          {event.hasAI && <AISmallBadge />}
        </div>
      ) : (
        <div className="px-2 py-1.5 flex flex-col gap-0.5 h-full overflow-hidden">
          <div className="flex items-start justify-between gap-1">
            <p
              className={`text-[12px] font-semibold ${c.titleText} leading-3.75 line-clamp-2 flex-1`}
            >
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

// ─── No-time task pills (tasks with deadline date but no specific time) ───────
function NoTimePill({
  event,
  color,
}: {
  event: CalendarEvent;
  color: (typeof CAL_COLOR)[CalendarEvent["color"]];
}) {
  return (
    <div
      className={`text-[10px] font-semibold ${color.bg} ${color.border} border-l-2 rounded-r-full px-2 py-0.5 truncate cursor-pointer hover:brightness-[0.97] transition-all`}
    >
      {event.title}
    </div>
  );
}

// ─── Calendar view ────────────────────────────────────────────────────────────
export function CalendarView({ tasks }: { tasks: Task[] }) {
  const today = new Date();
  const todayMonday = useMemo(() => getMondayOf(new Date()), []);

  const [weekOffset, setWeekOffset] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayMonday = useMemo(() => {
    return new Date(
      todayMonday.getFullYear(),
      todayMonday.getMonth(),
      todayMonday.getDate() + weekOffset * 7,
    );
  }, [todayMonday, weekOffset]);

  const weekDays = buildWeekDays(displayMonday);

  // Header month/year label
  const firstDay = weekDays[0].full;
  const lastDay = weekDays[6].full;
  const MONTH_ID = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const headerLabel =
    firstDay.getMonth() === lastDay.getMonth()
      ? `${MONTH_ID[firstDay.getMonth()]} ${firstDay.getFullYear()}`
      : `${MONTH_ID[firstDay.getMonth()]} – ${MONTH_ID[lastDay.getMonth()]} ${lastDay.getFullYear()}`;

  const todayVisible = weekOffset === 0;

  const hours = Array.from(
    { length: CAL_END - CAL_START },
    (_, i) => CAL_START + i,
  );
  const totalH = hours.length * HOUR_H + GRID_TOP;

  // Derive calendar events from tasks
  const allEvents = tasksToEvents(tasks, displayMonday);

  // Split: timed events vs no-time (midnight) events
  const timedEvents = allEvents.filter((e) => {
    // was placed at 09:00 due to no deadline time → show as pill instead if original was midnight
    // We detect this by checking if deadline parses to 00:00 local time
    const task = tasks.find((t) => t.id === e.id);
    if (!task?.deadline) return true;
    const dt = new Date(task.deadline);
    return dt.getHours() !== 0 || dt.getMinutes() !== 0;
  });
  const noTimeEvents = allEvents.filter((e) => !timedEvents.includes(e));

  // Current time pixel position
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
              <span
                className={`text-[10.5px] font-medium uppercase tracking-wide ${isToday ? "text-[#4a6fa5]" : "text-[#5d5d5a]/50"}`}
              >
                {day.short}
              </span>
              <div
                className={`w-7 h-7 flex items-center justify-center rounded-full text-[14px] font-semibold transition-colors
                  ${isToday ? "bg-[#4a6fa5] text-white" : "text-[#5d5d5a]"}`}
              >
                {day.dateNum}
              </div>
              {/* All-day / no-time pills */}
              {dayNoTimeEvents.length > 0 && (
                <div className="w-full px-1 flex flex-col gap-0.5 mt-0.5">
                  {dayNoTimeEvents.map((e) => (
                    <NoTimePill
                      key={e.id}
                      event={e}
                      color={CAL_COLOR[e.color]}
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
          <div
            className="shrink-0 relative"
            style={{ width: TIME_COL_W, height: totalH }}
          >
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
                {/* Hour lines */}
                {hours.map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="absolute left-0 right-0 border-t border-[rgba(93,93,90,0.08)]"
                    style={{ top: i * HOUR_H + GRID_TOP }}
                  />
                ))}
                {/* Half-hour dashed lines */}
                {hours.map((_, i) => (
                  <div
                    key={`hh-${i}`}
                    className="absolute left-0 right-0 border-t border-dashed border-[rgba(93,93,90,0.04)]"
                    style={{ top: i * HOUR_H + HOUR_H / 2 + GRID_TOP }}
                  />
                ))}

                {/* Current time line */}
                {isToday && currentTimePx !== null && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                    style={{ top: currentTimePx }}
                  >
                    <div className="w-2 h-2 rounded-full bg-[#e07b72] shrink-0 -ml-1" />
                    <div className="flex-1 h-px bg-[#e07b72]" />
                  </div>
                )}

                {dayEvents.map((e) => (
                  <CalendarEventCard key={e.id} event={e} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
