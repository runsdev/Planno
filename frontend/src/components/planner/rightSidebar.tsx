"use client";

import { Flame } from "lucide-react";
import { Task } from "./plannerTypes";
import { PRIORITY_SIDEBAR_BADGE } from "./plannerStyles";
import { STREAK_DAYS } from "./plannerMockData";

function AIBadge() {
  return (
    <span className="text-[12px] font-semibold text-[#4a6fa5] bg-[rgba(205,235,241,0.5)] border-[1.5px] border-[#4a6fa5] rounded-full px-3.5 py-1 whitespace-nowrap">
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
    <div className={`bg-[#f8f6f5] rounded-[10.5px] px-[10.5px] py-[10.5px] flex flex-col gap-1.75 transition-opacity ${task.completed ? "opacity-50" : ""}`}>
      <p className={`text-[12.25px] font-medium text-[#212121] leading-[17.5px] ${task.completed ? "line-through" : ""}`}>
        {task.title}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-semibold ${pb.bg} ${pb.border} ${pb.text} rounded-full px-1.75 py-[1.75px]`}>
          {task.priority}
        </span>
        <span className="text-[10.5px] font-normal text-[#6b6b6b]">{task.deadline}</span>
        <span className="text-[10px] font-normal text-[#6b6b6b] bg-[#e8e8e8] rounded-full px-1.75 py-[1.75px]">
          {task.duration}
        </span>
      </div>
    </div>
  );
}

export function RightSidebar({ tasks }: { tasks: Task[] }) {
  const topTasks = [
    ...tasks.filter((t) => t.priority === "Tinggi"),
    ...tasks.filter((t) => t.priority === "Sedang"),
  ].slice(0, 3);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount     = tasks.length;
  const progressPct    = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <aside className="w-77.25 shrink-0 bg-white shadow-[-4px_0px_4px_0px_rgba(93,93,90,0.1)] px-6.25 py-4.5 flex flex-col gap-5 overflow-y-auto">

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-semibold text-[#5d5d5a] capitalize tracking-[0.525px]">Hari ini</h3>
          <AIBadge />
        </div>
        <p className="text-[14px] font-normal italic text-[#5d5d5a] leading-4.25">
          Selesaikan Laporan Capstone sebelum jam 12 saat energimu masih tinggi. Simpan tugas sosial untuk sore hari.
        </p>
      </div>

      <Divider />

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-semibold text-[#5d5d5a] capitalize tracking-[0.525px]">Prioritas</h3>
          <AIBadge />
        </div>
        <div className="flex flex-col gap-1.75">
          {topTasks.map((task) => <SidebarPriorityCard key={task.id} task={task} />)}
        </div>
      </div>

      <Divider />

      <div className="flex flex-col gap-2.5">
        <h3 className="text-[18px] font-semibold text-[#5d5d5a] capitalize tracking-[0.525px]">Progress</h3>
        <div className="relative w-full h-1.75 rounded-full bg-[rgba(93,93,90,0.05)]">
          <div
            className="absolute left-0 top-0 h-1.75 rounded-full bg-[#8bbe97] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-[14px] font-normal text-[#5d5d5a]">
          {completedCount} dari {totalCount} tugas selesai
        </p>
      </div>

      <Divider />

      <div className="flex flex-col gap-2.5">
        <h3 className="text-[18px] font-semibold text-[#5d5d5a] capitalize tracking-[0.525px]">Streak</h3>
        <div className="flex items-center justify-between">
          {STREAK_DAYS.map((day, i) => (
            <div
              key={i}
              className={`w-5.25 h-5.25 rounded-full flex items-center justify-center text-[10px] font-semibold text-[#5d5d5a]
                ${day.active ? "bg-[#f8e8e9]" : day.current ? "bg-[rgba(93,93,90,0.1)] border-2 border-[#5d5d5a]" : "bg-[rgba(93,93,90,0.1)]"}`}
            >
              {day.label}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.75">
          <Flame className="w-3.5 h-3.5 text-[#e07b72]" />
          <span className="text-[10.5px] font-medium text-[#5d5d5a]">3 hari berturut-turut</span>
        </div>
      </div>
    </aside>
  );
}