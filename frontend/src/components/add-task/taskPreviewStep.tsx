"use client";

import { ParsedResult, ParsedCategory, ParsedPriority, ParsedType } from "./addTaskModal";
import { TaskPreviewField, PreviewTextInput } from "./taskPreviewField";

// ─── Style maps — same tokens as kanban cards ─────────────────────────────────
const TYPE_STYLE: Record<ParsedType, { bg: string; text: string }> = {
  // Green for Tugas, purple for Acara (berbeda dari kategori kanban)
  Tugas: { bg: "bg-[rgba(205,235,241,0.6)]", text: "text-[#4a6fa5]" },
  Acara: { bg: "bg-[#cbceea]",               text: "text-[#5d65b2]" },
};

// Matching kanban CATEGORY_META exactly
const CATEGORY_STYLE: Record<ParsedCategory, { bg: string; text: string }> = {
  Akademik: { bg: "bg-[#f8e5e5]",             text: "text-[#e07b72]" },
  Kerja:    { bg: "bg-[#def1d0]",             text: "text-[#3d6b35]" },
  Personal: { bg: "bg-[#cbceea]",             text: "text-[#5d65b2]" },
  Lainnya:  { bg: "bg-[rgba(93,93,90,0.15)]", text: "text-[#5d5d5a]" },
};

// Matching kanban PRIORITY_META badgeBg + badgeText exactly
const PRIORITY_STYLE: Record<ParsedPriority, { bg: string; text: string; border: string }> = {
  Tinggi: { bg: "bg-[#fdecea]",               text: "text-[#e07b72]", border: "border-[#e07b72]" },
  Sedang: { bg: "bg-[#fdf0e0]",               text: "text-[#d4974a]", border: "border-[#d4974a]" },
  Rendah: { bg: "bg-[rgba(222,241,208,0.6)]", text: "text-[#6bab7e]", border: "border-[#6bab7e]" },
};

const CATEGORIES: ParsedCategory[] = ["Akademik", "Kerja", "Personal", "Lainnya"];
const PRIORITIES: ParsedPriority[] = ["Tinggi", "Sedang", "Rendah"];

// ─── Chip toggle ──────────────────────────────────────────────────────────────
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
        const s       = styleMap[opt];
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

// ─── Preview step ─────────────────────────────────────────────────────────────
interface TaskPreviewStepProps {
  result: ParsedResult;
  onEdit: (field: keyof ParsedResult, value: string) => void;
}

export function TaskPreviewStep({ result, onEdit }: TaskPreviewStepProps) {
  const typeStyle = TYPE_STYLE[result.type];

  return (
    <div className="bg-[#f8f6f5] rounded-[12px] p-4 flex flex-col gap-4">
      {/* Preview header + type badge */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#5d5d5a]/60 uppercase tracking-wide">
          Preview
        </span>
        {/* Type chip — Tugas: blue, Acara: purple */}
        <div className="flex gap-1.5">
          {(["Tugas", "Acara"] as ParsedType[]).map((t) => {
            const s = TYPE_STYLE[t];
            const isActive = result.type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => onEdit("type", t)}
                className={`h-6 px-3 rounded-full text-[11px] font-semibold transition-all cursor-pointer border
                  ${isActive
                    ? `${s.bg} ${s.text} border-transparent`
                    : "bg-white border-[rgba(33,33,33,0.1)] text-[#5d5d5a]/40 hover:border-[rgba(93,93,90,0.2)]"
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
        <PreviewTextInput
          value={result.title}
          onChange={(v) => onEdit("title", v)}
        />
      </TaskPreviewField>

      {/* Deadline + Durasi */}
      <div className="grid grid-cols-2 gap-3">
        <TaskPreviewField label="Deadline">
          <PreviewTextInput
            value={result.deadline}
            onChange={(v) => onEdit("deadline", v)}
          />
        </TaskPreviewField>
        <TaskPreviewField label="Durasi">
          <PreviewTextInput
            value={result.duration}
            onChange={(v) => onEdit("duration", v)}
          />
        </TaskPreviewField>
      </div>

      {/* Kategori */}
      <TaskPreviewField label="Kategori">
        <ChipToggle<ParsedCategory>
          value={result.category}
          options={CATEGORIES}
          styleMap={CATEGORY_STYLE}
          onChange={(v) => onEdit("category", v)}
        />
      </TaskPreviewField>

      {/* Prioritas */}
      <TaskPreviewField label="Prioritas">
        <ChipToggle<ParsedPriority>
          value={result.priority}
          options={PRIORITIES}
          styleMap={PRIORITY_STYLE}
          onChange={(v) => onEdit("priority", v)}
        />
      </TaskPreviewField>

      {/* AI note */}
      <p className="text-[11px] font-normal italic text-[#6b6b6b]">
        AI akan menjadwalkan tugas ini di slot kosong yang sesuai.
      </p>
    </div>
  );
}