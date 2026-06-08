"use client";

import { useState, Suspense, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { KanbanView } from "@/components/planner/kanbanView";
import { CalendarView } from "@/components/planner/calendarView";
import { RightSidebar } from "@/components/planner/rightSidebar";
import { FilterType, Task } from "@/components/planner/plannerTypes";
import { AddTaskModal, ParsedResult } from "@/components/add-task/addTaskModal";
import { FocusTask } from "@/components/focus/focusModal";
import { getDeadlineColor } from "@/lib/utils";

type TaskProgress = Record<string, { completedSessions: number; totalFocusSeconds: number }>;

function parsedToTask(result: ParsedResult): Omit<Task, "id"> {
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
  const [tasks, setTasks]               = useState<Task[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("Semua");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [taskProgress, setTaskProgress] = useState<TaskProgress>({});
  const [searchQuery, setSearchQuery]   = useState(""); // ← new

  const viewParam = searchParams.get("view");
  const initialView: "Kanban" | "Calendar" =
    viewParam === "Calendar" ? "Calendar" : "Kanban";
  const [activeView, setActiveView] = useState<"Kanban" | "Calendar">(initialView);

  // ── Load tasks from DB ──────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Task[] | null) => {
        if (data && data.length > 0) setTasks(data);
      })
      .catch(() => {});
  }, []);

  // ── Mutations ───────────────────────────────────────────────────────────────

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
    const tempId = `temp-${Date.now()}`;
    setTasks((prev: Task[]) => [{ id: tempId, ...taskData }, ...prev]);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      if (res.ok) {
        const saved: Task = await res.json();
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
        setTasks((prev: Task[]) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, completed: true, actualSeconds: totalSeconds }
            : t,
        ),
      );
      setTaskProgress((prev: TaskProgress) => {
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

  const handleEditTask = useCallback(async (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    try {
      await fetch(`/api/tasks/${updated.id}`, {
        method  : "PATCH",
        headers : { "Content-Type": "application/json" },
        body    : JSON.stringify({
          title    : updated.title,
          category : updated.category,
          priority : updated.priority,
          duration : updated.duration,
        }),
      });
    } catch {}
  }, []);

  const handleUpdateTask = useCallback(async (id: string, updated: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t)),
    );
    try {
      await fetch(`/api/tasks/${id}`, {
        method  : "PATCH",
        headers : { "Content-Type": "application/json" },
        body    : JSON.stringify({
          ...(updated.title    !== undefined && { title:    updated.title }),
          ...(updated.category !== undefined && { category: updated.category }),
          ...(updated.priority !== undefined && { priority: updated.priority }),
          ...(updated.duration !== undefined && { duration: updated.duration }),
          ...(updated.deadline !== undefined && { deadline: updated.deadline }),
        }),
      });
    } catch {}
  }, []);

  const handleDeleteTask = useCallback(async (id: string) => {
    setTasks((prev: Task[]) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    } catch {}
  }, []);

  // ── Filter + search ─────────────────────────────────────────────────────────
  // Apply category/status filter first, then search query on top
  const q = searchQuery.trim().toLowerCase();

  const filteredTasks = tasks
    .filter((task) => {
      if (activeFilter === "Semua") return true;
      if (activeFilter === "Belum Selesai") return !task.completed;
      if (activeFilter === "Selesai") return task.completed;
      return task.category === activeFilter;
    })
    .filter((task) =>
      q ? task.title.toLowerCase().includes(q) : true,
    );

  // Calendar gets all tasks (no category filter) but still respects search
  const calendarTasks = tasks.filter((task) =>
    q ? task.title.toLowerCase().includes(q) : true,
  );

  const completedTaskIds = tasks.filter((t) => t.completed).map((t) => t.id);

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
        onOpenAddTask={() => setAddModalOpen(true)}
        tasks={focusTasks}
        onSearch={setSearchQuery} // ← new
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
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>

        <div
          className={`flex flex-1 overflow-hidden ${activeView !== "Calendar" ? "hidden" : ""}`}
        >
          <CalendarView
            tasks={calendarTasks} // ← uses search-filtered list
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
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