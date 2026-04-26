"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { KanbanView } from "@/components/planner/kanbanView";
import { CalendarView } from "@/components/planner/calendarView";
import { RightSidebar } from "@/components/planner/rightSidebar";
import { FilterType, Task } from "@/components/planner/plannerTypes";
import { INITIAL_TASKS } from "@/components/planner/plannerMockData";

function PlannerContent() {
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeFilter, setActiveFilter] = useState<FilterType>("Semua");

  const viewParam = searchParams.get("view");
  const [activeView, setActiveView] = useState<"Kanban" | "Calendar">(
    viewParam === "Calendar" ? "Calendar" : "Kanban",
  );

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "Semua") return true;
    if (activeFilter === "Belum Selesai") return !task.completed;
    if (activeFilter === "Selesai") return task.completed;
    return task.category === activeFilter;
  });

  return (
    <div
      className="min-h-screen bg-[#f8f6f5] flex flex-col"
      style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}
    >
      <Navbar activeView={activeView} onViewChange={setActiveView} />

      <div className="flex flex-1 overflow-hidden">
        {/*
          Kedua view selalu mounted (tidak di-unmount saat switch tab),
          sehingga scroll position dan state tetap tersimpan.
          CSS `hidden` (display:none) menyembunyikan tanpa unmount.
        */}

        {/* Kanban view */}
        <div
          className={`flex flex-col flex-1 overflow-hidden ${activeView !== "Kanban" ? "hidden" : ""}`}
        >
          <KanbanView
            tasks={filteredTasks}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onToggleTask={toggleTask}
          />
        </div>

        {/* Calendar view */}
        <div
          className={`flex flex-1 overflow-hidden ${activeView !== "Calendar" ? "hidden" : ""}`}
        >
          <CalendarView />
        </div>

        {/* Sidebar — selalu tampil di kedua view */}
        <RightSidebar tasks={tasks} />
      </div>
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f6f5]" />}>
      <PlannerContent />
    </Suspense>
  );
}
