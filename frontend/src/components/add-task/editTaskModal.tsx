"use client";

import { useState } from "react";
import { X, Lock } from "lucide-react";
import { Task } from "@/components/planner/plannerTypes";
import { TaskPreviewField } from "./taskPreviewField";
import type { ParsedCategory, ParsedPriority, ParsedType } from "./addTaskModal";

// ─── Style maps (sama dengan taskPreviewStep) ─────────────────────────────────
const CATEGORY_STYLE: Record<ParsedCategory, { bg: string; text: string }> = {
  Akademik: { bg: "bg-[#f8e5e5]",             text: "text-[#e07b72]" },
  Kerja:    { bg: "bg-[#def1d0]",             text: "text-[#3d6b35]" },
  Personal: { bg: "bg-[#cbceea]",             text: "text-[#5d65b2]" },
  Lainnya:  { bg: "bg-[rgba(93,93,90,0.15)]", text: "text-[#5d5d5a]" },
};

const PRIORITY_STYLE: Record<ParsedPriority, { bg: string; text: string; border: string }> = {
  Tinggi: { bg: "bg-[#fdecea]",               text: "text-[#e07b72]", border: "border-[#e07b72]" },
  Sedang: { bg: "bg-[#fdf0e0]",               text: "text-[#d4974a]", border: "border-[#d4974a]" },
  Rendah: { bg: "bg-[rgba(222,241,208,0.6)]", text: "text-[#6bab7e]", border: "border-[#6bab7e]" },
};

const TYPE_STYLE: Record<ParsedType, { bg: string; text: string }> = {
  Tugas: { bg: "bg-[rgba(205,235,241,0.6)]", text: "text-[#4a6fa5]" },
  Acara: { bg: "bg-[#cbceea]",               text: "text-[#5d65b2]" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toDateStr(dt: string | null | undefined): string {
  if (!dt) return "";
  const d = new Date(dt.replace(" ", "T"));
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

function toTimeStr(dt: string | null | undefined): string {
  if (!dt) return "";
  const d = new Date(dt.replace(" ", "T"));
  if (isNaN(d.getTime())) return "";
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

function computeStartTime(endTime: string, duration: string): string {
  if (!endTime) return "";
  const [eh, em] = endTime.split(":").map(Number);
  const jamMatch  = duration.match(/(\d+)\s*jam/);
  const mntMatch  = duration.match(/(\d+)\s*mnt/);
  const totalMins = (jamMatch ? parseInt(jamMatch[1]) * 60 : 0)
                  + (mntMatch ? parseInt(mntMatch[1]) : 0) || 60;
  const startMins = (eh * 60 + em) - totalMins;
  if (startMins < 0) return "00:00";
  return `${String(Math.floor(startMins/60)).padStart(2,"0")}:${String(startMins%60).padStart(2,"0")}`;
}

function computeDuration(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return "~1 jam";
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return "~1 jam";
  if (mins < 60) return `~${mins} mnt`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `~${h} jam ${m} mnt` : `~${h} jam`;
}

// ─── Input components mengikuti desain yang sudah ada ─────────────────────────
function TimeInputField({ value, onChange, disabled }: {
  value: string; onChange: (v: string) => void; disabled?: boolean;
}) {
  return (
    <input type="time" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
      className={`w-full rounded-[8px] border px-1.75 text-[13px] text-[#212121] outline-none transition-colors
        ${disabled
          ? "border-[rgba(33,33,33,0.08)] bg-[#f0efee] text-[#5d5d5a]/40 cursor-not-allowed"
          : "border-[rgba(33,33,33,0.12)] bg-white focus:border-[rgba(93,93,90,0.4)]"
        }`}
    />
  );
}

function DateInputField({ value, onChange, disabled }: {
  value: string; onChange: (v: string) => void; disabled?: boolean;
}) {
  return (
    <input type="date" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
      className={`w-full rounded-[8px] border px-1.75 text-[13px] text-[#212121] outline-none transition-colors
        ${disabled
          ? "border-[rgba(33,33,33,0.08)] bg-[#f0efee] text-[#5d5d5a]/40 cursor-not-allowed"
          : "border-[rgba(33,33,33,0.12)] bg-white focus:border-[rgba(93,93,90,0.4)]"
        }`}
    />
  );
}

// ─── ChipToggle ───────────────────────────────────────────────────────────────
function ChipToggle<T extends string>({
  value, options, styleMap, onChange,
}: {
  value: T; options: T[];
  styleMap: Record<T, { bg: string; text: string; border?: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => {
        const s = styleMap[opt];
        const isActive = value === opt;
        return (
          <button key={opt} type="button" onClick={() => onChange(opt)}
            className={`h-7 px-3 rounded-full text-[11px] font-semibold border transition-all cursor-pointer
              ${isActive
                ? `${s.bg} ${s.text} ${s.border ?? "border-transparent"}`
                : "bg-white border-[rgba(33,33,33,0.1)] text-[#5d5d5a]/50 hover:border-[rgba(93,93,90,0.3)]"
              }`}
          >{opt}</button>
        );
      })}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface EditTaskModalProps {
  task   : Task;
  open   : boolean;
  onClose: () => void;
  onSave : (updated: Partial<Task>) => void;
}

export function EditTaskModal({ task, open, onClose, onSave }: EditTaskModalProps) {
  const [title,    setTitle]    = useState(task.title);
  const [type,     setType]     = useState<ParsedType>("Tugas");
  const [category, setCategory] = useState<ParsedCategory>(task.category as ParsedCategory);
  const [priority, setPriority] = useState<ParsedPriority>(task.priority as ParsedPriority);

  // Waktu kegiatan — parse dari deadline + duration yang ada
  const endTimeInit   = toTimeStr(task.deadline);
  const startTimeInit = computeStartTime(endTimeInit, task.duration);
  const dateInit      = toDateStr(task.deadline);

  const [activityDate, setActivityDate] = useState(dateInit);
  const [startTime,    setStartTime]    = useState(startTimeInit);
  const [endTime,      setEndTime]      = useState(endTimeInit);

  // Deadline terpisah (untuk Tugas)
  const [deadlineDate, setDeadlineDate] = useState(dateInit);
  const [deadlineTime, setDeadlineTime] = useState(endTimeInit);

  if (!open) return null;

  const isAcara  = type === "Acara";
  const duration = computeDuration(startTime, endTime);

  const handleEndTimeChange = (t: string) => {
    setEndTime(t);
    if (isAcara) setDeadlineTime(t);
  };

  const handleTypeChange = (t: ParsedType) => {
    setType(t);
    if (t === "Acara") setDeadlineTime(endTime);
  };

  const finalDeadlineISO = isAcara
    ? (activityDate && endTime   ? `${activityDate}T${endTime}`   : null)
    : (deadlineDate && deadlineTime ? `${deadlineDate}T${deadlineTime}` : null);

  const handleSave = () => {
    onSave({ title, category, priority, duration, deadline: finalDeadlineISO });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
      onMouseDown={(e) => { if (e.currentTarget === e.target) onClose(); }}
    >
      <div
        className="relative bg-white rounded-[18px] shadow-[0px_8px_32px_0px_rgba(33,33,33,0.16)] w-full max-w-120 mx-4 flex flex-col overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-[18px] font-semibold text-[#212121]">Edit Task</h2>
          <button type="button" onClick={onClose}
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
              <span className="text-[11px] font-semibold text-[#5d5d5a]/60 uppercase tracking-wide">Edit</span>
              <div className="flex gap-1.5">
                {(["Tugas", "Acara"] as ParsedType[]).map((t) => {
                  const s = TYPE_STYLE[t];
                  const isActive = type === t;
                  return (
                    <button key={t} type="button" onClick={() => handleTypeChange(t)}
                      className={`h-6 px-3 rounded-full text-[11px] font-semibold transition-all cursor-pointer border
                        ${isActive ? `${s.bg} ${s.text} border-transparent` : "bg-white border-[rgba(33,33,33,0.1)] text-[#5d5d5a]/40"}`}
                    >{t}</button>
                  );
                })}
              </div>
            </div>

            {/* Judul */}
            <TaskPreviewField label="Judul">
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-[8px] border border-[rgba(33,33,33,0.12)] bg-white px-3 py-1.75 text-[13px] text-[#212121] outline-none focus:border-[rgba(93,93,90,0.4)] transition-colors"
              />
            </TaskPreviewField>

            {/* Tanggal */}
            <TaskPreviewField label="Tanggal">
              <DateInputField value={activityDate} onChange={setActivityDate} />
            </TaskPreviewField>

            {/* Jam Mulai & Jam Selesai */}
            <div className="grid grid-cols-2 gap-3">
              <TaskPreviewField label="Jam Mulai">
                <TimeInputField value={startTime} onChange={setStartTime} />
              </TaskPreviewField>
              <TaskPreviewField label="Jam Selesai">
                <TimeInputField value={endTime} onChange={handleEndTimeChange} />
              </TaskPreviewField>
            </div>

            {/* Durasi otomatis */}
            <div className="flex items-center gap-2 -mt-2 px-1">
              <span className="text-[11px] text-[#5d5d5a]/50">Durasi:</span>
              <span className="text-[11px] font-semibold text-[#5d5d5a]">{duration}</span>
            </div>

            {/* Deadline */}
            {isAcara ? (
              <TaskPreviewField label="Deadline">
                <div className="flex items-center gap-2 rounded-[8px] border border-[rgba(33,33,33,0.08)] bg-[#f0efee] px-3 py-1.75">
                  <span className="text-[13px] text-[#5d5d5a]/40 select-none">–</span>
                  <span className="text-[13px] text-[#5d5d5a]/40">
                    Tidak ada deadline untuk acara
                  </span>
                </div>
              </TaskPreviewField>
            ) : (
              <div className="flex flex-col gap-1.5">
                <div className="grid grid-cols-2 gap-3">
                  <TaskPreviewField label="Deadline Tanggal">
                    <DateInputField value={deadlineDate} onChange={setDeadlineDate} />
                  </TaskPreviewField>
                  <TaskPreviewField label="Deadline Jam">
                    <TimeInputField value={deadlineTime} onChange={setDeadlineTime} />
                  </TaskPreviewField>
                </div>
                <p className="text-[11px] text-[#5d5d5a]/50 px-1">
                  Batas waktu penyelesaian (boleh beda dari jam selesai kerja)
                </p>
              </div>
            )}

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
            <button type="button" onClick={onClose}
              className="h-9 px-4 text-[13px] font-medium text-[#5d5d5a] hover:text-[#212121] transition-colors cursor-pointer"
            >Batal</button>
            <button type="button" onClick={handleSave}
              className="h-9 px-5 rounded-[10.5px] text-[13px] font-semibold bg-[#4a4a47] text-[#f8f6f5] hover:bg-[#333331] transition-all cursor-pointer"
            >Simpan</button>
          </div>
        </div>
      </div>
    </div>
  );
}