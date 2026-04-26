"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CAL_COLOR } from "./plannerStyles";
import { CALENDAR_EVENTS } from "./plannerMockData";
import { CAL_START, CAL_END, HOUR_H, GRID_TOP, TIME_COL_W, CalendarEvent } from "./plannerTypes";

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
  const MONTH_ID = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      short:   SHORT[i],
      dateNum: String(d.getDate()),
      month:   MONTH_ID[d.getMonth()],
      year:    d.getFullYear(),
      full:    new Date(d),
    };
  });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
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
  const top    = getTimePx(event.startHour);
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
          <p className={`text-[11px] font-semibold ${c.titleText} truncate flex-1`}>{event.title}</p>
          {event.hasAI && <AISmallBadge />}
        </div>
      ) : (
        <div className="px-2 py-1.5 flex flex-col gap-0.5 h-full overflow-hidden">
          <div className="flex items-start justify-between gap-1">
            <p className={`text-[12px] font-semibold ${c.titleText} leading-3.75 line-clamp-2 flex-1`}>
              {event.title}
            </p>
            {event.hasAI && <div className="shrink-0"><AISmallBadge /></div>}
          </div>
          <p className={`text-[10px] font-normal ${c.timeText}`}>{timeLabel}</p>
          {event.deadline && (
            <p className={`text-[10px] font-normal ${c.timeText}`}>{event.deadline}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Calendar view ────────────────────────────────────────────────────────────
export function CalendarView() {
  const today      = new Date();
  const todayMonday = getMondayOf(today);

  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week
  const scrollRef  = useRef<HTMLDivElement>(null);

  // Compute Monday of the displayed week
  const displayMonday = new Date(todayMonday);
  displayMonday.setDate(todayMonday.getDate() + weekOffset * 7);

  const weekDays = buildWeekDays(displayMonday);

  // Header month/year label (show range if week crosses months)
  const firstDay = weekDays[0].full;
  const lastDay  = weekDays[6].full;
  const MONTH_ID = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const headerLabel = firstDay.getMonth() === lastDay.getMonth()
    ? `${MONTH_ID[firstDay.getMonth()]} ${firstDay.getFullYear()}`
    : `${MONTH_ID[firstDay.getMonth()]} – ${MONTH_ID[lastDay.getMonth()]} ${lastDay.getFullYear()}`;

  // Is today visible in current displayed week?
  const todayVisible = weekOffset === 0;

  const hours  = Array.from({ length: CAL_END - CAL_START }, (_, i) => CAL_START + i);
  const totalH = hours.length * HOUR_H + GRID_TOP;

  // Current time pixel position
  const [currentTimePx, setCurrentTimePx] = useState<number | null>(null);
  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const h   = now.getHours() + now.getMinutes() / 60;
      setCurrentTimePx(h >= CAL_START && h <= CAL_END ? getTimePx(h) : null);
    };
    calc();
    const id = setInterval(calc, 60_000);
    return () => clearInterval(id);
  }, []);

  // Scroll to current time helper
  const scrollToNow = useCallback(() => {
    if (!scrollRef.current) return;
    const now = new Date();
    const h   = now.getHours() + now.getMinutes() / 60;
    const px  = getTimePx(Math.max(h, CAL_START));
    scrollRef.current.scrollTop = Math.max(px - 120, 0);
  }, []);

  // Scroll to now on mount
  useEffect(() => { scrollToNow(); }, [scrollToNow]);

  const goToToday = () => {
    setWeekOffset(0);
    // Wait for re-render then scroll
    setTimeout(scrollToNow, 0);
  };

  // For mockup: events shown only when displaying current week
  const visibleEvents = weekOffset === 0 ? CALENDAR_EVENTS : [];

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

        {/* "Hari Ini" hanya aktif saat bukan di minggu ini */}
        <button
          type="button"
          onClick={goToToday}
          disabled={todayVisible}
          className={`h-[26.5px] px-3 rounded-full border text-[10.5px] font-semibold transition-colors
            ${todayVisible
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
          return (
            <div
              key={i}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 border-r border-[rgba(93,93,90,0.1)] last:border-r-0 ${isToday ? "bg-white" : ""}`}
            >
              <span className={`text-[10.5px] font-medium uppercase tracking-wide ${isToday ? "text-[#4a6fa5]" : "text-[#5d5d5a]/50"}`}>
                {day.short}
              </span>
              <div
                className={`w-7 h-7 flex items-center justify-center rounded-full text-[14px] font-semibold transition-colors
                  ${isToday ? "bg-[#4a6fa5] text-white" : "text-[#5d5d5a]"}`}
              >
                {day.dateNum}
              </div>
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
            const dayEvents = visibleEvents.filter((e) => e.dayIndex === dayIdx);

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

                {dayEvents.map((e) => <CalendarEventCard key={e.id} event={e} />)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}