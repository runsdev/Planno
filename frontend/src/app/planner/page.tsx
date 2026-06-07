"use client";

import { useState, Suspense, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { KanbanView } from "@/components/planner/kanbanView";
import { CalendarView } from "@/components/planner/calendarView";
import { RightSidebar } from "@/components/planner/rightSidebar";
import { FilterType, Task } from "@/components/planner/plannerTypes";
// import { INITIAL_TASKS } from "@/components/planner/plannerMockData";
import { AddTaskModal, ParsedResult } from "@/components/add-task/addTaskModal";
import { FocusTask } from "@/components/focus/focusModal";
import { getDeadlineColor } from "@/lib/utils";

type TaskProgress = Record<
  string,
  {
    completedSessions: number;
    totalFocusSeconds: number;
  }
>;

function parsedToTask(result: ParsedResult): Omit<Task, "id"> {
  // result.deadlineISO is a naive local-time string like "2026-05-25 14:00".
  // new Date("2026-05-25T14:00") in the browser interprets it as local time,
  // so .toISOString() produces the correct UTC representation for DB storage.
  const deadlineUTC = result.deadlineISO
    ? new Date(result.deadlineISO.replace(" ", "T")).toISOString()
    : null;
  return {
    title: result.title,
    deadline: deadlineUTC,
    deadlineColor: getDeadlineColor(deadlineUTC),
    duration: result.duration,
    category: result.category,
    priority: result.priority,
    completed: false,
  };
}

function buildOccupiedSlots(tasks: Task[]): Array<{ start: string; end: string }> {
  return tasks
    .filter((t) => t.deadline && !t.completed)
    .flatMap((t) => {
      const endDt = new Date(t.deadline!);
      if (endDt.getHours() === 0 && endDt.getMinutes() === 0) return [];

      const jamMatch  = t.duration?.match(/(\d+)\s*jam/);
      const mntMatch  = t.duration?.match(/(\d+)\s*mnt/);
      const totalMins = (jamMatch ? parseInt(jamMatch[1]) * 60 : 0)
                      + (mntMatch ? parseInt(mntMatch[1]) : 0)
                      || 60;

      const startDt = new Date(endDt.getTime() - totalMins * 60_000);
      const fmt = (d: Date) => {
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      return [{ start: fmt(startDt), end: fmt(endDt) }];
    });
}

function PlannerContent() {
  const searchParams = useSearchParams();
  // const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("Semua");
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Progress fokus per task
  const [taskProgress, setTaskProgress] = useState<TaskProgress>({});

  const viewParam = searchParams.get("view");
  const initialView: "Kanban" | "Calendar" =
    viewParam === "Calendar" ? "Calendar" : "Kanban";
  const [activeView, setActiveView] = useState<"Kanban" | "Calendar">(
    initialView,
  );

  // ── Load tasks from DB ────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Task[] | null) => {
        if (data && data.length > 0) setTasks(data);
      })
      .catch(() => {}); // keep INITIAL_TASKS on error
  }, []);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, completed: !t.completed };
        fetch(`/api/tasks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: next.completed }),
        }).catch(() => {});
        return next;
      }),
    );
  }, []);

  const handleAddTask = useCallback(async (result: ParsedResult) => {
    const taskData = parsedToTask(result);
    // Optimistic: prepend with temp id
    const tempId = `temp-${Date.now()}`;
    setTasks((prev) => [{ id: tempId, ...taskData }, ...prev]);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      if (res.ok) {
        const saved: Task = await res.json();
        // Replace temp id with real DB id
        setTasks((prev) => prev.map((t) => (t.id === tempId ? saved : t)));
      }
    } catch {
      // Keep optimistic task if API fails
    }
  }, []);

  const handleSessionFinished = useCallback(
    (taskId: string, addedSeconds: number) => {
      setTaskProgress((prev) => {
        const existing = prev[taskId] ?? {
          completedSessions: 0,
          totalFocusSeconds: 0,
        };
        return {
          ...prev,
          [taskId]: {
            completedSessions: existing.completedSessions + 1,
            totalFocusSeconds: existing.totalFocusSeconds + addedSeconds,
          },
        };
      });
    },
    [],
  );

  const handleMarkComplete = useCallback(
    (taskId: string, totalSeconds: number) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, completed: true, actualSeconds: totalSeconds }
            : t,
        ),
      );
      setTaskProgress((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });

      fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true, actualSeconds: totalSeconds }),
      }).catch(() => {});
    },
    [],
  );

  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "Semua") return true;
    if (activeFilter === "Belum Selesai") return !task.completed;
    if (activeFilter === "Selesai") return task.completed;
    return task.category === activeFilter;
  });

  const completedTaskIds = tasks.filter((t) => t.completed).map((t) => t.id);

  // Map tasks → FocusTask for the focus modal
  const focusTasks: FocusTask[] = tasks
    .filter((t) => !t.completed)
    .map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority as FocusTask["priority"],
    }));

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
        onOpenAddTask={() => {
          console.log("openAddTask clicked"); 
          setAddModalOpen(true);
        }}
        tasks={focusTasks}
      />

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex flex-col flex-1 overflow-hidden ${activeView !== "Kanban" ? "hidden" : ""}`}
        >
          <KanbanView
            tasks={filteredTasks}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onToggleTask={toggleTask}
            onOpenAddTask={() => setAddModalOpen(true)}
          />
        </div>
        <div
          className={`flex flex-1 overflow-hidden ${activeView !== "Calendar" ? "hidden" : ""}`}
        >
          <CalendarView tasks={tasks} />
        </div>
        <RightSidebar tasks={tasks} />
      </div>

      <AddTaskModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddTask}
        occupiedSlots={buildOccupiedSlots(tasks)}
      />
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
