"use client";

import { CheckCircle2, Circle, Plus } from "lucide-react";
import { Task, Priority, FilterType, FILTERS } from "./plannerTypes";
import { PRIORITY_META, CATEGORY_META } from "./plannerStyles";

function TaskCard({ task, onToggle }: { task: Task; onToggle: (id: number) => void }) {
  const cat = CATEGORY_META[task.category];
  const deadlineColor = task.deadlineColor ?? "text-[#5d5d5a]";

  return (
    <div className={`bg-white rounded-[14.5px] shadow-[0px_1px_4px_0px_rgba(33,33,33,0.08)] border-l-8 ${PRIORITY_META[task.priority].borderLeft} transition-opacity duration-200 ${task.completed ? "opacity-55" : ""}`}>
      <div className="p-3 space-y-2">
        <div className="flex items-start gap-2.5">
          <button type="button" onClick={() => onToggle(task.id)} className="shrink-0 mt-px cursor-pointer transition-colors">
            {task.completed
              ? <CheckCircle2 className="w-5 h-5 text-[#6bab7e]" />
              : <Circle className="w-5 h-5 text-[#5d5d5a]/30 hover:text-[#5d5d5a]/60" />}
          </button>
          <span className={`text-[12.25px] font-semibold text-[#5d5d5a] leading-[17.5px] transition-all duration-200 ${task.completed ? "line-through text-[#5d5d5a]/50" : ""}`}>
            {task.title}
          </span>
        </div>
        <div className="flex items-center gap-1.5 pl-7">
          <span className={`text-[10.5px] font-normal ${task.completed ? "text-[#5d5d5a]/40" : deadlineColor}`}>
            {task.deadline}
          </span>
          <span className="text-[10.5px] font-normal text-[#6b6b6b] bg-[#f7f6fb] rounded-full px-1.75 py-[1.75px]">
            {task.duration}
          </span>
        </div>
        <div className="pl-7">
          <span className={`text-[10.5px] font-semibold ${cat.bg} ${cat.text} rounded-full px-1.75 py-[3.5px]`}>
            {task.category}
          </span>
        </div>
      </div>
    </div>
  );
}

function AddTaskButton() {
  return (
    <button type="button" className="w-full h-[40.5px] border border-dashed border-[rgba(93,93,90,0.3)] rounded-[14.5px] flex items-center justify-center gap-1.5 text-[12.25px] font-normal text-[rgba(93,93,90,0.8)] hover:bg-[#f0efee] transition-colors cursor-pointer">
      <Plus className="w-4 h-4" />
      Tambah tugas
    </button>
  );
}

function KanbanColumn({ priority, tasks, onToggle }: { priority: Priority; tasks: Task[]; onToggle: (id: number) => void }) {
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
        {tasks.map((task) => <TaskCard key={task.id} task={task} onToggle={onToggle} />)}
        <AddTaskButton />
      </div>
    </div>
  );
}

type KanbanViewProps = {
  tasks: Task[];
  activeFilter: FilterType;
  onFilterChange: (f: FilterType) => void;
  onToggleTask: (id: number) => void;
};

export function KanbanView({ tasks, activeFilter, onFilterChange, onToggleTask }: KanbanViewProps) {
  const byPriority = (p: Priority) => tasks.filter((t) => t.priority === p);

  return (
    <>
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
          <KanbanColumn priority="Tinggi" tasks={byPriority("Tinggi")} onToggle={onToggleTask} />
          <KanbanColumn priority="Sedang" tasks={byPriority("Sedang")} onToggle={onToggleTask} />
          <KanbanColumn priority="Rendah" tasks={byPriority("Rendah")} onToggle={onToggleTask} />
        </div>
      </div>
    </>
  );
}