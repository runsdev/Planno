"use client";

import { useState } from "react";
import {
  Search,
  Kanban,
  Calendar,
  Timer,
  Settings,
  User,
  PenLine,
  Plus,
  Circle,
  Flame,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Priority = "Tinggi" | "Sedang" | "Rendah";
type Category = "Akademik" | "Kerja" | "Personal" | "Lainnya";

interface Task {
  id: number;
  title: string;
  deadline: string;
  deadlineColor?: string;
  duration: string;
  category: Category;
  priority: Priority;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const PRIORITY_META: Record<
  Priority,
  {
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    borderLeft: string;
    countBg: string;
    countText: string;
  }
> = {
  Tinggi: {
    badgeBg: "bg-[#fdecea]",
    badgeBorder: "border-[#e07b72]",
    badgeText: "text-[#e07b72]",
    borderLeft: "border-l-[#f8e5e5]",
    countBg: "bg-[#f7f6fb]",
    countText: "text-[#6b6b6b]",
  },
  Sedang: {
    badgeBg: "bg-[#fdf0e0]",
    badgeBorder: "border-[#d4974a]",
    badgeText: "text-[#d4974a]",
    borderLeft: "border-l-[#def1d0]",
    countBg: "bg-[#f8f6f5]",
    countText: "text-[#5d5d5a]",
  },
  Rendah: {
    badgeBg: "bg-[rgba(222,241,208,0.6)]",
    badgeBorder: "border-[#6bab7e]",
    badgeText: "text-[#6bab7e]",
    borderLeft: "border-l-[#cbceea]",
    countBg: "bg-[#f8f6f5]",
    countText: "text-[#5d5d5a]",
  },
};

const CATEGORY_META: Record<Category, { bg: string; text: string }> = {
  Akademik: { bg: "bg-[#f8e5e5]", text: "text-[#e07b72]" },
  Kerja: { bg: "bg-[#def1d0]", text: "text-[#3d6b35]" },
  Personal: { bg: "bg-[#cbceea]", text: "text-[#5d65b2]" },
  Lainnya: { bg: "bg-[rgba(93,93,90,0.3)]", text: "text-[#5d5d5a]" },
};

const PRIORITY_SIDEBAR_BADGE: Record<
  Priority,
  { bg: string; border: string; text: string }
> = {
  Tinggi: {
    bg: "bg-[#fdecea]",
    border: "border border-[#e07b72]",
    text: "text-[#e07b72]",
  },
  Sedang: {
    bg: "bg-[#fdf0e0]",
    border: "border border-[#d4974a]",
    text: "text-[#d4974a]",
  },
  Rendah: {
    bg: "bg-[rgba(222,241,208,0.6)]",
    border: "border border-[#6bab7e]",
    text: "text-[#6bab7e]",
  },
};

const INITIAL_TASKS: Task[] = [
  {
    id: 1,
    title: "Kerjakan Laporan Capstone",
    deadline: "hari ini 23:59",
    deadlineColor: "text-[#e07b72]",
    duration: "2 jam",
    category: "Akademik",
    priority: "Tinggi",
  },
  {
    id: 2,
    title: "Belajar Statistik UTS",
    deadline: "besok",
    duration: "3 jam",
    category: "Akademik",
    priority: "Tinggi",
  },
  {
    id: 3,
    title: "Presentasi Seminar KP",
    deadline: "3 hari lagi",
    duration: "2 jam",
    category: "Akademik",
    priority: "Tinggi",
  },
  {
    id: 4,
    title: "Meeting Tim KKN",
    deadline: "Senin",
    duration: "1 jam",
    category: "Kerja",
    priority: "Sedang",
  },
  {
    id: 5,
    title: "Telepon mama",
    deadline: "minggu ini",
    duration: "30 mnt",
    category: "Personal",
    priority: "Rendah",
  },
  {
    id: 6,
    title: "Beli perlengkapan tugas",
    deadline: "pekan ini",
    duration: "1 jam",
    category: "Lainnya",
    priority: "Rendah",
  },
];

const FILTERS = [
  "Semua",
  "Belum Selesai",
  "Selesai",
  "Akademik",
  "Kerja",
  "Personal",
  "Lainnya",
] as const;
type FilterType = (typeof FILTERS)[number];

const STREAK_DAYS = [
  { label: "S", active: true },
  { label: "M", active: true },
  { label: "S", active: true },
  { label: "R", active: false },
  { label: "K", active: false, current: true },
  { label: "J", active: false },
  { label: "S", active: false },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function NavIconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="flex items-center justify-center w-9 h-9 rounded-[6px] bg-[#f8f6f5] border border-[#e2e3db] hover:bg-[#eee] transition-colors cursor-pointer">
      {children}
    </button>
  );
}

function TaskCard({ task }: { task: Task }) {
  const cat = CATEGORY_META[task.category];
  const deadlineColor = task.deadlineColor ?? "text-[#5d5d5a]";
  return (
    <div
      className={`bg-white rounded-[14.5px] shadow-[0px_1px_4px_0px_rgba(33,33,33,0.08)] border-l-8 ${PRIORITY_META[task.priority].borderLeft}`}
    >
      <div className="p-3 space-y-2">
        <div className="flex items-start gap-2.5">
          <Circle className="w-5 h-5 text-[#5d5d5a]/30 shrink-0 mt-px" />
          <span className="text-[12.25px] font-semibold text-[#5d5d5a] leading-[17.5px]">
            {task.title}
          </span>
        </div>
        <div className="flex items-center gap-1.5 pl-[28px]">
          <span className={`text-[10.5px] font-normal ${deadlineColor}`}>
            {task.deadline}
          </span>
          <span className="text-[10.5px] font-normal text-[#6b6b6b] bg-[#f7f6fb] rounded-full px-[7px] py-[1.75px]">
            {task.duration}
          </span>
        </div>
        <div className="pl-[28px]">
          <span
            className={`text-[10.5px] font-semibold ${cat.bg} ${cat.text} rounded-full px-[7px] py-[3.5px]`}
          >
            {task.category}
          </span>
        </div>
      </div>
    </div>
  );
}

function AddTaskButton() {
  return (
    <button className="w-full h-[40.5px] border border-dashed border-[rgba(93,93,90,0.3)] rounded-[14.5px] flex items-center justify-center gap-1.5 text-[12.25px] font-normal text-[rgba(93,93,90,0.8)] hover:bg-[#f0efee] transition-colors cursor-pointer">
      <Plus className="w-4 h-4" />
      Tambah tugas
    </button>
  );
}

function KanbanColumn({
  priority,
  tasks,
}: {
  priority: Priority;
  tasks: Task[];
}) {
  const meta = PRIORITY_META[priority];
  return (
    <div className="flex flex-col gap-[10.5px] w-[339px] shrink-0">
      <div className="bg-white rounded-tl-[14.5px] rounded-tr-[14.5px] shadow-[0px_1px_4px_0px_rgba(33,33,33,0.08)] px-[10.5px] py-[10.5px] flex items-center gap-[7px] h-[44px]">
        <span
          className={`text-[10.5px] font-semibold border ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText} rounded-full px-[11.5px] py-[4.5px]`}
        >
          {priority}
        </span>
        <span
          className={`text-[10.5px] font-medium ${meta.countText} ${meta.countBg} rounded-full px-[7px] py-[3.5px]`}
        >
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-[10.5px]">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        <AddTaskButton />
      </div>
    </div>
  );
}

function AIBadge() {
  return (
    <span className="text-[12px] font-semibold text-[#4a6fa5] bg-[rgba(205,235,241,0.5)] border-[1.5px] border-[#4a6fa5] rounded-full px-[14px] py-[4px] whitespace-nowrap">
      Rekomendasi AI
    </span>
  );
}

function Divider() {
  return <div className="h-px bg-[rgba(93,93,90,0.2)] w-full shrink-0" />;
}

function SidebarPriorityCard({ task }: { task: Task }) {
  const pb = PRIORITY_SIDEBAR_BADGE[task.priority];
  return (
    <div className="bg-[#f8f6f5] rounded-[10.5px] px-[10.5px] pt-[10.5px] pb-[10.5px] flex flex-col gap-[7px]">
      <p className="text-[12.25px] font-medium text-[#212121] leading-[17.5px]">
        {task.title}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`text-[10px] font-semibold ${pb.bg} ${pb.border} ${pb.text} rounded-full px-[7px] py-[1.75px]`}
        >
          {task.priority}
        </span>
        <span className="text-[10.5px] font-normal text-[#6b6b6b]">
          {task.deadline}
        </span>
        <span className="text-[10px] font-normal text-[#6b6b6b] bg-[#e8e8e8] rounded-full px-[7px] py-[1.75px]">
          {task.duration}
        </span>
      </div>
    </div>
  );
}

function RightSidebar({ tasks }: { tasks: Task[] }) {
  const topTasks = [
    ...tasks.filter((t) => t.priority === "Tinggi"),
    ...tasks.filter((t) => t.priority === "Sedang"),
  ].slice(0, 3);

  const completedCount = 1;
  const totalCount = tasks.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <aside className="w-[309px] shrink-0 bg-white shadow-[-4px_0px_4px_0px_rgba(93,93,90,0.1)] px-[25px] py-[18px] flex flex-col gap-5 overflow-y-auto">
      {/* Hari Ini */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-semibold text-[#5d5d5a] capitalize tracking-[0.525px]">
            Hari ini
          </h3>
          <AIBadge />
        </div>
        <p className="text-[14px] font-normal italic text-[#5d5d5a] leading-[17px]">
          Selesaikan Laporan Capstone sebelum jam 12 saat energimu masih tinggi.
          Simpan tugas sosial untuk sore hari.
        </p>
      </div>

      <Divider />

      {/* Prioritas */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-semibold text-[#5d5d5a] capitalize tracking-[0.525px]">
            Prioritas
          </h3>
          <AIBadge />
        </div>
        <div className="flex flex-col gap-[7px]">
          {topTasks.map((task) => (
            <SidebarPriorityCard key={task.id} task={task} />
          ))}
        </div>
      </div>

      <Divider />

      {/* Progress */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-[18px] font-semibold text-[#5d5d5a] capitalize tracking-[0.525px]">
          Progress
        </h3>
        <div className="relative w-full h-[7px] rounded-full bg-[rgba(93,93,90,0.05)]">
          <div
            className="absolute left-0 top-0 h-[7px] rounded-full bg-[#8bbe97]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-[14px] font-normal text-[#5d5d5a]">
          {completedCount} dari {totalCount} tugas selesai
        </p>
      </div>

      <Divider />

      {/* Streak */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-[18px] font-semibold text-[#5d5d5a] capitalize tracking-[0.525px]">
          Streak
        </h3>
        <div className="flex items-center justify-between">
          {STREAK_DAYS.map((day, i) => (
            <div
              key={i}
              className={`w-[21px] h-[21px] rounded-full flex items-center justify-center text-[10px] font-semibold text-[#5d5d5a]
              ${day.active ? "bg-[#f8e8e9]" : (day as { current?: boolean }).current ? "bg-[rgba(93,93,90,0.1)] border-2 border-[#5d5d5a]" : "bg-[rgba(93,93,90,0.1)]"}`}
            >
              {day.label}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-[7px]">
          <Flame className="w-[14px] h-[14px] text-[#e07b72]" />
          <span className="text-[10.5px] font-medium text-[#5d5d5a]">
            3 hari berturut-turut
          </span>
        </div>
      </div>
    </aside>
  );
}

// ─── Calendar ────────────────────────────────────────────────────────────────

interface CalendarEvent {
  id: number;
  title: string;
  startHour: number;
  endHour: number;
  day: 0 | 1 | 2;
  color: "red" | "blue" | "gray";
  deadline?: string;
  hasAI?: boolean;
}

const CALENDAR_DAYS = ["Sen, 20 Apr", "Sel, 21 Apr", "Rab, 22 Apr"];
const CAL_START = 7;
const CAL_END = 22;
const HOUR_H = 60; // px per hour

const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 1,
    title: "Kerjakan Laporan Capstone",
    startHour: 7,
    endHour: 10,
    day: 0,
    color: "red",
    deadline: "hari ini 23:59",
    hasAI: true,
  },
  {
    id: 2,
    title: "Kuliah MKWK",
    startHour: 10.75,
    endHour: 13.5,
    day: 0,
    color: "blue",
  },
  {
    id: 3,
    title: "Belajar Statistik",
    startHour: 13.5,
    endHour: 17.5,
    day: 0,
    color: "red",
    hasAI: true,
  },
  {
    id: 4,
    title: "Senior Project",
    startHour: 8.5,
    endHour: 14.25,
    day: 1,
    color: "blue",
  },
  {
    id: 5,
    title: "Beli Perlengkapan Tugas",
    startHour: 16,
    endHour: 18.25,
    day: 2,
    color: "gray",
    hasAI: true,
  },
];

const CAL_COLOR: Record<
  CalendarEvent["color"],
  { bg: string; border: string; deadline: string }
> = {
  red: {
    bg: "bg-[rgba(248,232,233,0.7)]",
    border: "border-l-[#e07b72]",
    deadline: "text-[#e07b72]",
  },
  blue: {
    bg: "bg-[rgba(205,235,241,0.7)]",
    border: "border-l-[#4a6fa5]",
    deadline: "text-[#4a6fa5]",
  },
  gray: {
    bg: "bg-[rgba(222,222,222,0.7)]",
    border: "border-l-[rgba(93,93,90,0.7)]",
    deadline: "text-[#5d5d5a]",
  },
};

function AISmallBadge() {
  return (
    <span className="inline-flex items-center gap-[3px] text-[12px] font-semibold text-[#4a6fa5] bg-[rgba(205,235,241,0.5)] border-[1.5px] border-[#4a6fa5] rounded-full px-[10px] py-[3px] whitespace-nowrap">
      <span className="text-[10px]">✦</span> AI
    </span>
  );
}

function CalendarEventCard({ event }: { event: CalendarEvent }) {
  const c = CAL_COLOR[event.color];
  const top = (event.startHour - CAL_START) * HOUR_H;
  const height = (event.endHour - event.startHour) * HOUR_H;
  return (
    <div
      className={`absolute left-2 right-2 rounded-[14.5px] shadow-[0px_1px_4px_0px_rgba(33,33,33,0.08)] border-l-8 ${c.bg} ${c.border} overflow-hidden`}
      style={{ top, height }}
    >
      <div className="p-[9px] flex flex-col gap-1 h-full">
        <div className="flex items-start justify-between gap-1">
          <p className="text-[14px] font-semibold text-[#5d5d5a] leading-[17.5px] line-clamp-2">
            {event.title}
          </p>
          {event.hasAI && (
            <div className="shrink-0 mt-[2px]">
              <AISmallBadge />
            </div>
          )}
        </div>
        {event.deadline && (
          <p className={`text-[12px] font-normal ${c.deadline}`}>
            {event.deadline}
          </p>
        )}
      </div>
    </div>
  );
}

function CalendarView() {
  const hours = Array.from(
    { length: CAL_END - CAL_START },
    (_, i) => CAL_START + i,
  );
  const totalH = hours.length * HOUR_H;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Day headers */}
      <div className="flex shrink-0 pl-[68px] pr-0 border-b border-[rgba(93,93,90,0.15)]">
        {CALENDAR_DAYS.map((day, i) => (
          <div
            key={i}
            className="flex-1 px-4 py-3 text-[18px] font-semibold text-[#5d5d5a] border-r border-[rgba(93,93,90,0.1)] last:border-r-0"
          >
            {day}
          </div>
        ))}
        {/* "Hari Ini" tab at end */}
        <div className="shrink-0 px-3 py-3 flex items-end">
          <span className="text-[14px] font-semibold text-[#3a72a0] border-b border-[#3a72a0] leading-none pb-[2px] whitespace-nowrap">
            Hari Ini
          </span>
        </div>
      </div>

      {/* Scrollable time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex" style={{ minHeight: totalH + 40 }}>
          {/* Time labels */}
          <div
            className="w-[68px] shrink-0 relative"
            style={{ height: totalH + 40 }}
          >
            {hours.map((h, i) => (
              <div
                key={h}
                className="absolute right-[14px] text-[14px] font-medium text-[#5d5d5a] text-right translate-y-[-50%]"
                style={{ top: i * HOUR_H + 20 }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {CALENDAR_DAYS.map((_, dayIdx) => (
            <div
              key={dayIdx}
              className="flex-1 relative border-r border-[rgba(93,93,90,0.12)] last:border-r-0"
              style={{ height: totalH + 40 }}
            >
              {/* Hour grid lines */}
              {hours.map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 border-t border-[rgba(93,93,90,0.12)]"
                  style={{ top: i * HOUR_H + 20 }}
                />
              ))}
              {/* Events */}
              {CALENDAR_EVENTS.filter((e) => e.day === dayIdx).map((e) => (
                <CalendarEventCard key={e.id} event={e} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KanbanPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("Semua");
  const [activeView, setActiveView] = useState<"Kanban" | "Calendar">("Kanban");

  const filteredTasks = INITIAL_TASKS.filter((task) => {
    if (activeFilter === "Semua" || activeFilter === "Belum Selesai")
      return true;
    if (activeFilter === "Selesai") return false;
    return task.category === activeFilter;
  });

  const byPriority = (p: Priority) =>
    filteredTasks.filter((t) => t.priority === p);

  return (
    <div
      className="min-h-screen bg-[#f8f6f5] flex flex-col"
      style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}
    >
      {/* ── Navbar ── */}
      <header className="h-[50px] bg-[#f8f6f5] border-b border-[rgba(93,93,90,0.7)] flex items-center px-6 shrink-0 gap-4">
        {/* Logo */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative flex items-center justify-center w-[26px] h-[26px]">
            <div className="absolute inset-0 rounded-[15px] bg-[#5d5d5a]/10" />
            <Kanban className="w-4 h-4 text-[#5d5d5a] relative z-10" />
          </div>
          <span className="text-[18px] font-bold italic text-[#5d5d5a]">
            planno
          </span>
        </div>

        {/* Center Nav */}
        <div className="flex-1 flex items-center justify-center gap-1">
          {(["Kanban", "Calendar"] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`flex items-center gap-1.5 px-[10px] py-[10px] text-[14px] font-semibold transition-colors cursor-pointer ${
                activeView === view
                  ? "text-[#5d5d5a]"
                  : "text-[rgba(93,93,90,0.7)]"
              }`}
            >
              {view === "Kanban" ? (
                <Kanban className="w-5 h-5" />
              ) : (
                <Calendar className="w-5 h-5" />
              )}
              {view}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <NavIconBtn>
            <Search className="w-[19px] h-[19px] text-[#5d5d5a]" />
          </NavIconBtn>
          <button className="flex items-center gap-2 bg-[#5d5d5a] text-[#f8f6f5] rounded-[6px] px-5 h-9 text-[14px] font-semibold hover:bg-[#4a4a47] transition-colors cursor-pointer shrink-0">
            <PenLine className="w-5 h-5" />
            Tambah
          </button>
          <NavIconBtn>
            <Timer className="w-6 h-6 text-[#5d5d5a]" />
          </NavIconBtn>
          <NavIconBtn>
            <Settings className="w-[23px] h-[23px] text-[#5d5d5a]" />
          </NavIconBtn>
          <button className="flex items-center justify-center cursor-pointer">
            <User className="w-[26px] h-[26px] text-[#5d5d5a]" />
          </button>
        </div>
      </header>

      {/* ── Filter Bar (Kanban only) ── */}
      {activeView === "Kanban" && (
        <div className="px-6 py-[9px] flex items-center gap-2 flex-wrap">
          {FILTERS.map((filter, idx) => (
            <div key={filter} className="flex items-center gap-2">
              {idx === 3 && (
                <div className="w-px h-[14px] bg-[rgba(93,93,90,0.7)]" />
              )}
              <button
                onClick={() => setActiveFilter(filter)}
                className={`text-[10.5px] font-semibold rounded-full px-[11.5px] h-[26.5px] flex items-center border transition-colors cursor-pointer ${
                  activeFilter === filter
                    ? "bg-[#5d5d5a] text-[#f8f6f5] border-[rgba(93,93,90,0.7)]"
                    : "bg-[#f8f6f5] text-[#5d5d5a] border-[rgba(93,93,90,0.7)] hover:bg-[#eee]"
                }`}
              >
                {filter}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex flex-1 overflow-hidden">
        {activeView === "Kanban" ? (
          <>
            <main className="flex-1 p-6 overflow-x-auto">
              <div className="flex gap-4 min-w-fit">
                <KanbanColumn priority="Tinggi" tasks={byPriority("Tinggi")} />
                <KanbanColumn priority="Sedang" tasks={byPriority("Sedang")} />
                <KanbanColumn priority="Rendah" tasks={byPriority("Rendah")} />
              </div>
            </main>
            <RightSidebar tasks={filteredTasks} />
          </>
        ) : (
          <>
            <CalendarView />
            <RightSidebar tasks={filteredTasks} />
          </>
        )}
      </div>
    </div>
  );
}
