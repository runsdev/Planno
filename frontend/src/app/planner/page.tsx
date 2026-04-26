"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { KanbanView } from "@/components/planner/kanbanView";
import { CalendarView } from "@/components/planner/calendarView";
import { RightSidebar } from "@/components/planner/rightSidebar";
import { FilterType, Task } from "@/components/planner/plannerTypes";
import { INITIAL_TASKS } from "@/components/planner/plannerMockData";

type TaskProgress = Record<number, {
  completedSessions: number;
  totalFocusSeconds: number;
}>;

export default function PlannerPage() {
  const searchParams    = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeFilter, setActiveFilter] = useState<FilterType>("Semua");

  // Progress fokus per task — persists selama halaman tidak di-refresh
  // TODO: persist ke localStorage atau backend agar tidak hilang saat refresh
  const [taskProgress, setTaskProgress] = useState<TaskProgress>({});

  const viewParam    = searchParams.get("view");
  const initialView: "Kanban" | "Calendar" =
    viewParam === "Calendar" ? "Calendar" : "Kanban";
  const [activeView, setActiveView] = useState<"Kanban" | "Calendar">(initialView);

  useEffect(() => {
    const v = searchParams.get("view");
    if (v === "Calendar" || v === "Kanban") setActiveView(v);
  }, [searchParams]);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // Dipanggil setiap kali 1 sesi fokus selesai (manual atau otomatis)
  // Akumulasi sessions dan detik fokus per task
  const handleSessionFinished = (taskId: number, addedSeconds: number) => {
    setTaskProgress((prev) => {
      const existing = prev[taskId] ?? { completedSessions: 0, totalFocusSeconds: 0 };
      return {
        ...prev,
        [taskId]: {
          completedSessions: existing.completedSessions + 1,
          totalFocusSeconds: existing.totalFocusSeconds + addedSeconds,
        },
      };
    });
  };

  // Tandai tugas selesai dari focus modal
  const handleMarkComplete = (taskId: number, totalSeconds: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, completed: true, actualSeconds: totalSeconds }
          : t
      )
    );
    // Bersihkan progress task yang sudah selesai
    setTaskProgress((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
    // TODO: sync ke backend
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "Semua")         return true;
    if (activeFilter === "Belum Selesai") return !task.completed;
    if (activeFilter === "Selesai")       return task.completed;
    return task.category === activeFilter;
  });

  const completedTaskIds = tasks
    .filter((t) => t.completed)
    .map((t) => t.id);

  return (
    <div
      className="min-h-screen bg-[#f8f6f5] flex flex-col"
      style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}
    >
      <Navbar
        activeView={activeView}
        onViewChange={setActiveView}
        onMarkComplete={handleMarkComplete}
        taskProgress={taskProgress}
        onSessionFinished={handleSessionFinished}
        completedTaskIds={completedTaskIds} 
      />

      <div className="flex flex-1 overflow-hidden">
        <div className={`flex flex-col flex-1 overflow-hidden ${activeView !== "Kanban" ? "hidden" : ""}`}>
          <KanbanView
            tasks={filteredTasks}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onToggleTask={toggleTask}
          />
        </div>
        <div className={`flex flex-1 overflow-hidden ${activeView !== "Calendar" ? "hidden" : ""}`}>
          <CalendarView />
        </div>
        <RightSidebar tasks={tasks} />
      </div>
    </div>
  );
}