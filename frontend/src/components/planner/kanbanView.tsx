"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Plus, Clock, Pencil, Trash2, Flag } from "lucide-react"; 
import { Task, Priority, FilterType, FILTERS } from "./plannerTypes";
import { PRIORITY_META, CATEGORY_META } from "./plannerStyles";
import { formatDeadline } from "@/lib/utils";
import { EditTaskModal } from "@/components/add-task/editTaskModal";

function formatActualTime(seconds: number): string {
  if (!seconds || seconds <= 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0 && m > 0) return `${h} jam ${m} mnt`;
  if (h > 0) return `${h} jam`;
  if (m > 0) return `${m} mnt`;
  return `${s} dtk`; 
}

// ─── Task card ────────────────────────────────────────────────────────────────
function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const cat = CATEGORY_META[task.category];
  const deadlineColor = task.deadlineColor ?? "text-[#5d5d5a]";

  const deadlineText = formatDeadline(task.deadline);
  const isHariH = deadlineText.includes("Hari ini") || deadlineText.includes("Terlambat");
  
  const flagColor = isHariH ? "text-[#e07b72]" : "text-[#5d5d5a]/40";
  const currentDeadlineTextColor = isHariH 
    ? "text-[#e07b72] font-semibold" 
    : (task.completed ? "text-[#5d5d5a]/40" : deadlineColor);

  return (
    <div
      className={`bg-white rounded-[14.5px] shadow-[0px_1px_4px_0px_rgba(33,33,33,0.08)] border-l-8 ${cat.borderLeft} transition-opacity duration-200 ${task.completed ? "opacity-55" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="p-3 space-y-2">
        {/* Title row */}
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            onClick={() => onToggle(task.id)}
            className="shrink-0 mt-px cursor-pointer transition-colors"
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-[#6bab7e]" />
            ) : (
              <Circle className="w-5 h-5 text-[#5d5d5a]/30 hover:text-[#5d5d5a]/60" />
            )}
          </button>
          <span
            className={`flex-1 text-[12.25px] font-semibold text-[#5d5d5a] leading-[17.5px] transition-all duration-200 ${task.completed ? "line-through text-[#5d5d5a]/50" : ""}`}
          >
            {task.title}
          </span>

          {/* Edit/Delete — muncul saat hover */}
          {hovered && !task.completed && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="w-6 h-6 flex items-center justify-center rounded-[6px] text-[#5d5d5a]/40 hover:text-[#4a6fa5] hover:bg-[#f0f4ff] transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                className="w-6 h-6 flex items-center justify-center rounded-[6px] text-[#5d5d5a]/40 hover:text-[#e07b72] hover:bg-[#fdecea] transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Deadline + duration row (Clean Text Only) */}
        <div className="flex items-center gap-3 pl-7 flex-wrap">
          {/* Info Deadline */}
          <div className="flex items-center gap-1 shrink-0">
            <Flag className={`w-3.5 h-3.5 ${task.completed ? "text-[#5d5d5a]/20" : flagColor}`} />
            <span className={`text-[10.5px] ${currentDeadlineTextColor}`}>
              {deadlineText}
            </span>
          </div>

          {/* Info Durasi — Polos tanpa background badge */}
          <div className="flex items-center gap-1 shrink-0">
            <Clock className="w-3.5 h-3.5 text-[#5d5d5a]/30" />
            <span className="text-[10.5px] font-normal text-[#6b6b6b]">
              {task.duration}
            </span>
          </div>
        </div>

        {/* Category badge */}
        <div className="pl-7">
          <span className={`text-[10.5px] font-semibold ${cat.bg} ${cat.text} rounded-full px-1.75 py-[3.5px]`}>
            {task.category}
          </span>
        </div>

        {task.completed && task.actualSeconds !== undefined && task.actualSeconds > 0 && (
          <div className="pl-7 flex items-center gap-1">
            <Clock className="w-2.75 h-2.75 text-[#6bab7e]" />
            <span className="text-[10.5px] font-medium text-[#6bab7e]">
              Selesai dalam {formatActualTime(task.actualSeconds)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function AddTaskButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-[40.5px] border border-dashed border-[rgba(93,93,90,0.3)] rounded-[14.5px] flex items-center justify-center gap-1.5 text-[12.25px] font-normal text-[rgba(93,93,90,0.8)] hover:bg-[#f0efee] transition-colors cursor-pointer"
    >
      <Plus className="w-4 h-4" />
      Tambah tugas
    </button>
  );
}

function KanbanColumn({
  priority, tasks, onToggle, onOpenAddTask, onEdit, onDelete,
}: {
  priority: Priority;
  tasks: Task[];
  onToggle: (id: string) => void;
  onOpenAddTask?: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}) {
  const meta = PRIORITY_META[priority];
  return (
    <div className="flex flex-col gap-[10.5px] w-84.75 shrink-0">
      <div className="bg-white rounded-tl-[14.5px] rounded-tr-[14.5px] shadow-[0px_1px_4px_0px_rgba(33,33,33,0.08)] px-[10.5px] py-[10.5px] flex items-center gap-1.75 h-11">
        <span className={`text-[10.5px] font-semibold border ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText} rounded-full px-[11.5px] py-[4.5px]`}>
          {priority}
        </span>
        <span className={`text-[10.5px] font-medium ${meta.countText} ${meta.countBg} rounded-full px-1.75 py-[3.5px]`}>
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-[10.5px]">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        <AddTaskButton onClick={onOpenAddTask} />
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  taskTitle,
  onConfirm,
  onCancel,
}: {
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
      onMouseDown={(e) => { if (e.currentTarget === e.target) onCancel(); }}
    >
      <div
        className="bg-white rounded-[18px] shadow-[0px_8px_32px_0px_rgba(33,33,33,0.16)] w-full max-w-sm mx-4 p-6 flex flex-col items-center gap-4"
        style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}
      >
        {/* Icon */}
        <div className="w-10 h-10 rounded-full bg-[#fdecea] flex items-center justify-center">
          <Trash2 className="w-5 h-5 text-[#e07b72]" />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1 text-center">
          <h3 className="text-[16px] font-semibold text-[#212121]">
            Hapus Task?
          </h3>
          <p className="text-[13px] text-[#5d5d5a]">
            <span className="font-semibold">"{taskTitle}"</span> akan dihapus
            permanen dan tidak bisa dikembalikan.
          </p>
        </div>

        {/* Actions */}
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

// ─── KanbanView ───────────────────────────────────────────────────────────────
type KanbanViewProps = {
  tasks: Task[];
  activeFilter: FilterType;
  onFilterChange: (f: FilterType) => void;
  onToggleTask: (id: string) => void;
  onOpenAddTask?: () => void;
  onEditTask: (task: Task) => void;     // ← tambah
  onDeleteTask: (id: string) => void;   // ← tambah
};

export function KanbanView({
  tasks, activeFilter, onFilterChange, onToggleTask,
  onOpenAddTask, onEditTask, onDeleteTask,
}: KanbanViewProps) {
  const [editingTask,  setEditingTask]  = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null); // ← tambah

  const handleEdit = (task: Task) => setEditingTask(task);

  // ← Ganti: delete sekarang buka confirm dulu
  const handleDeleteClick = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) setDeletingTask(task);
  };

  const handleConfirmDelete = () => {
    if (!deletingTask) return;
    onDeleteTask(deletingTask.id);
    setDeletingTask(null);
  };

  const byPriority = (p: Priority) => tasks.filter((t) => t.priority === p);

  return (
    <>
      {/* filter bar */}
      <div className="px-6 py-2.25 flex items-center gap-2 flex-wrap shrink-0">
        {FILTERS.map((filter, idx) => (
          <div key={filter} className="flex items-center gap-2">
            {idx === 3 && <div className="w-px h-3.5 bg-[rgba(93,93,90,0.7)]" />}
            <button
              type="button"
              onClick={() => onFilterChange(filter)}
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

      <div className="flex-1 overflow-auto p-6">
        <div className="flex gap-4 min-w-fit">
          {(["Tinggi", "Sedang", "Rendah"] as Priority[]).map((p) => (
            <KanbanColumn
              key={p}
              priority={p}
              tasks={byPriority(p)}
              onToggle={onToggleTask}
              onOpenAddTask={onOpenAddTask}
              onEdit={handleEdit}
              onDelete={handleDeleteClick} // ← pakai handleDeleteClick
            />
          ))}
        </div>
      </div>

      {/* Edit modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          open={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(updated) => {
            onEditTask({ ...editingTask, ...updated });
            setEditingTask(null);
          }}
        />
      )}

      {/* Delete confirmation modal */}
      {deletingTask && (
        <DeleteConfirmModal
          taskTitle={deletingTask.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingTask(null)}
        />
      )}
    </>
  );
}