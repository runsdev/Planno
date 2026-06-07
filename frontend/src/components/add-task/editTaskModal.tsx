"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Task } from "@/components/planner/plannerTypes";
import { TaskPreviewField, PreviewTextInput } from "./taskPreviewField";
import type { ParsedCategory, ParsedPriority, ParsedType } from "./addTaskModal";

// ─── Style maps (sama dengan taskPreviewStep) ─────────────────────────────────
const CATEGORY_STYLE: Record<ParsedCategory, { bg: string; text: string }> = {
  Akademik : { bg: "bg-[#f8e5e5]",               text: "text-[#e07b72]"  },
  Kerja    : { bg: "bg-[#def1d0]",               text: "text-[#3d6b35]"  },
  Personal : { bg: "bg-[#cbceea]",               text: "text-[#5d65b2]"  },
  Lainnya  : { bg: "bg-[rgba(93,93,90,0.15)]",   text: "text-[#5d5d5a]"  },
};

const PRIORITY_STYLE: Record<ParsedPriority, { bg: string; text: string; border: string }> = {
  Tinggi : { bg: "bg-[#fdecea]",               text: "text-[#e07b72]", border: "border-[#e07b72]" },
  Sedang : { bg: "bg-[#fdf0e0]",               text: "text-[#d4974a]", border: "border-[#d4974a]" },
  Rendah : { bg: "bg-[rgba(222,241,208,0.6)]", text: "text-[#6bab7e]", border: "border-[#6bab7e]" },
};

const TYPE_STYLE: Record<ParsedType, { bg: string; text: string }> = {
  Tugas : { bg: "bg-[rgba(205,235,241,0.6)]", text: "text-[#4a6fa5]"  },
  Acara : { bg: "bg-[#cbceea]",               text: "text-[#5d65b2]"  },
};

function ChipToggle<T extends string>({
  value, options, styleMap, onChange,
}: {
  value: T;
  options: T[];
  styleMap: Record<T, { bg: string; text: string; border?: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => {
        const s = styleMap[opt];
        const isActive = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`h-7 px-3 rounded-full text-[11px] font-semibold border transition-all cursor-pointer
              ${isActive
                ? `${s.bg} ${s.text} ${"border" in s && s.border ? s.border : "border-transparent"}`
                : "bg-white border-[rgba(33,33,33,0.1)] text-[#5d5d5a]/50 hover:border-[rgba(93,93,90,0.3)]"
              }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface EditTaskModalProps {
  task: Task;
  open: boolean;
  onClose: () => void;
  onSave: (updated: Partial<Task>) => void;
}

export function EditTaskModal({ task, open, onClose, onSave }: EditTaskModalProps) {
  const [title,    setTitle]    = useState(task.title);
  const [category, setCategory] = useState<ParsedCategory>(task.category as ParsedCategory);
  const [priority, setPriority] = useState<ParsedPriority>(task.priority as ParsedPriority);
  const [duration, setDuration] = useState(task.duration);
  const [type,     setType]     = useState<ParsedType>("Tugas");

  if (!open) return null;

  const handleSave = () => {
    onSave({ title, category, priority, duration });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
      onMouseDown={(e) => { if (e.currentTarget === e.target) onClose(); }}
    >
      <div
        className="relative bg-white rounded-[18px] shadow-[0px_8px_32px_0px_rgba(33,33,33,0.16)] w-full max-w-120 mx-4 flex flex-col overflow-hidden"
        style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-[18px] font-semibold text-[#212121]">Edit Task</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[#5d5d5a]/50 hover:bg-[#5d5d5a]/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 flex flex-col gap-4">
          <div className="bg-[#f8f6f5] rounded-[12px] p-4 flex flex-col gap-4">

            {/* Type */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#5d5d5a]/60 uppercase tracking-wide">
                Edit
              </span>
              <div className="flex gap-1.5">
                {(["Tugas", "Acara"] as ParsedType[]).map((t) => {
                  const s = TYPE_STYLE[t];
                  const isActive = type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`h-6 px-3 rounded-full text-[11px] font-semibold transition-all cursor-pointer border
                        ${isActive
                          ? `${s.bg} ${s.text} border-transparent`
                          : "bg-white border-[rgba(33,33,33,0.1)] text-[#5d5d5a]/40"
                        }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <TaskPreviewField label="Judul">
              <PreviewTextInput value={title} onChange={setTitle} />
            </TaskPreviewField>

            {/* Durasi */}
            <TaskPreviewField label="Durasi">
              <PreviewTextInput value={duration} onChange={setDuration} />
            </TaskPreviewField>

            {/* Kategori */}
            <TaskPreviewField label="Kategori">
              <ChipToggle<ParsedCategory>
                value={category}
                options={["Akademik", "Kerja", "Personal", "Lainnya"]}
                styleMap={CATEGORY_STYLE}
                onChange={setCategory}
              />
            </TaskPreviewField>

            {/* Prioritas */}
            <TaskPreviewField label="Prioritas">
              <ChipToggle<ParsedPriority>
                value={priority}
                options={["Tinggi", "Sedang", "Rendah"]}
                styleMap={PRIORITY_STYLE}
                onChange={setPriority}
              />
            </TaskPreviewField>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 text-[13px] font-medium text-[#5d5d5a] hover:text-[#212121] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="h-9 px-5 rounded-[10.5px] text-[13px] font-semibold bg-[#4a4a47] text-[#f8f6f5] hover:bg-[#333331] transition-all cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}