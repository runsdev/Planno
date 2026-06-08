"use client";

import { useState } from "react";
import { Lock, CalendarClock } from "lucide-react";
import { ParsedResult, ParsedCategory, ParsedPriority, ParsedType } from "./addTaskModal";
import { TaskPreviewField, PreviewTextInput } from "./taskPreviewField";
import { formatDeadline } from "@/lib/utils";

// ─── Style maps (tidak berubah) ───────────────────────────────────────────────
const TYPE_STYLE: Record<ParsedType, { bg: string; text: string }> = {
  Tugas: { bg: "bg-[rgba(205,235,241,0.6)]", text: "text-[#4a6fa5]" },
  Acara: { bg: "bg-[#cbceea]",               text: "text-[#5d65b2]" },
};

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function extractDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.replace("T", " ").split(" ")[0] ?? "";
}

function extractTime(iso: string | null | undefined): string {
  if (!iso) return "";
  return (iso.replace("T", " ").split(" ")[1] ?? "").substring(0, 5);
}

function buildISO(date: string, time: string): string {
  return date && time ? `${date} ${time}` : "";
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
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full rounded-[8px] border px-3 py-1.75 text-[13px] text-[#212121] outline-none transition-colors
        ${disabled
          ? "border-[rgba(33,33,33,0.08)] bg-[#f0efee] text-[#5d5d5a]/40 cursor-not-allowed"
          : "border-[rgba(33,33,33,0.12)] bg-white focus:border-[rgba(93,93,90,0.4)]"
        }`}
    />
  );
}

function DateInputField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-[8px] border border-[rgba(33,33,33,0.12)] bg-white px-1.75 text-[13px] text-[#212121] outline-none focus:border-[rgba(93,93,90,0.4)] transition-colors"
    />
  );
}

// ─── ChipToggle (tidak berubah) ───────────────────────────────────────────────
function ChipToggle<T extends string>({
  value, options, styleMap, onChange,
}: {
  value: T;
  options: T[];
  styleMap: Record<T, { bg: string; text: string; border?: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 flex-wrap">
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

// ─── Preview Step ─────────────────────────────────────────────────────────────
interface TaskPreviewStepProps {
  result : ParsedResult;
  onEdit : (updates: Partial<ParsedResult>) => void; // ← batch update
}

export function TaskPreviewStep({ result, onEdit }: TaskPreviewStepProps) {
  const [date,         setDate]         = useState(extractDate(result.startISO) || extractDate(result.deadlineISO));
  const [startTime,    setStartTime]    = useState(extractTime(result.startISO));
  const [endTime,      setEndTime]      = useState(extractTime(result.deadlineISO)); 
  const [deadlineDate, setDeadlineDate] = useState(extractDate(result.deadlineISO));
  const [deadlineTime, setDeadlineTime] = useState(extractTime(result.deadlineISO));

  const isAcara  = result.type === "Acara";
  const duration = computeDuration(startTime, endTime);

  const handleTypeChange = (t: ParsedType) => {
    if (t === "Acara") {
      onEdit({ type: t, deadlineISO: null, deadline: "–" });
    } else {
      const restoredISO = buildISO(deadlineDate, deadlineTime);
      onEdit({ 
        type: t, 
        deadlineISO: restoredISO, 
        deadline: formatDeadline(restoredISO),
        startISO: buildISO(date, startTime) // Kunci agar startISO tetap aman terjaga
      });
    }
  };

  const handleDateChange = (d: string) => {
    setDate(d);
    const newStartISO = buildISO(d, startTime);
    if (isAcara) {
      const newDeadlineISO = buildISO(d, endTime);
      setDeadlineDate(d);
      onEdit({ startISO: newStartISO, deadlineISO: newDeadlineISO, deadline: formatDeadline(newDeadlineISO) });
    } else {
      onEdit({ startISO: newStartISO });
    }
  };

  const handleStartTimeChange = (t: string) => {
    setStartTime(t);
    onEdit({ startISO: buildISO(date, t), duration: computeDuration(t, endTime) });
  };

  const handleEndTimeChange = (t: string) => {
    setEndTime(t);
    const dur = computeDuration(startTime, t);
    if (isAcara) {
      const newDeadlineISO = buildISO(date, t);
      setDeadlineTime(t);
      onEdit({ startISO: buildISO(date, startTime), deadlineISO: newDeadlineISO, deadline: formatDeadline(newDeadlineISO), duration: dur });
    } else {
      onEdit({ startISO: buildISO(date, startTime), duration: dur });
    }
  };

  const handleDeadlineDateChange = (d: string) => {
    setDeadlineDate(d);
    const newDeadlineISO = buildISO(d, deadlineTime);
    onEdit({ deadlineISO: newDeadlineISO, deadline: formatDeadline(newDeadlineISO) });
  };

  const handleDeadlineTimeChange = (t: string) => {
    setDeadlineTime(t);
    const newDeadlineISO = buildISO(deadlineDate, t);
    onEdit({ deadlineISO: newDeadlineISO, deadline: formatDeadline(newDeadlineISO) });
  };

  return (
    <div className="bg-[#f8f6f5] rounded-[12px] p-4 flex flex-col gap-3">
      {/* Header + Type */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#5d5d5a]/60 uppercase tracking-wide">Preview</span>
        <div className="flex gap-1.5">
          {(["Tugas", "Acara"] as ParsedType[]).map((t) => {
            const s = TYPE_STYLE[t];
            const isActive = result.type === t;
            return (
              <button key={t} type="button" onClick={() => handleTypeChange(t)}
                className={`h-6 px-3 rounded-full text-[11px] font-semibold transition-all cursor-pointer border
                  ${isActive ? `${s.bg} ${s.text} border-transparent` : "bg-white border-[rgba(33,33,33,0.1)] text-[#5d5d5a]/40 hover:border-[rgba(93,93,90,0.2)]"}`}
              >{t}</button>
            );
          })}
        </div>
      </div>

      {/* Reschedule notice */}
      {result.rescheduled && result.originalDeadline && (
        <div className="flex items-start gap-2 bg-[#fdf0e0] rounded-[8px] px-3 py-2">
          <CalendarClock className="w-3.5 h-3.5 text-[#d4974a] mt-0.5 shrink-0" />
          <p className="text-[11px] text-[#d4974a] leading-4">
            Waktu bentrok — dijadwalkan ulang dari{" "}
            <span className="font-semibold">{formatDeadline(result.originalDeadline)}</span>{" "}
            ke waktu kosong terdekat
          </p>
        </div>
      )}

      {/* Row 1: Judul full width */}
      <TaskPreviewField label="Judul">
        <PreviewTextInput value={result.title} onChange={(v) => onEdit({ title: v })} />
      </TaskPreviewField>

      {/* Row 2: Tanggal | Jam Mulai | Jam Selesai */}
      <div className="grid grid-cols-3 gap-3">
        <TaskPreviewField label="Tanggal">
          <DateInputField value={date} onChange={handleDateChange} />
        </TaskPreviewField>
        <TaskPreviewField label="Jam Mulai">
          <TimeInputField value={startTime} onChange={handleStartTimeChange} />
        </TaskPreviewField>
        <TaskPreviewField label="Jam Selesai">
          <TimeInputField value={endTime} onChange={handleEndTimeChange} />
        </TaskPreviewField>
      </div>

      {/* Durasi otomatis */}
      <div className="flex items-center gap-2 -mt-1 px-1">
        <span className="text-[11px] text-[#5d5d5a]/50">Durasi:</span>
        <span className="text-[11px] font-semibold text-[#5d5d5a]">{duration}</span>
      </div>

      {/* Row 3: Deadline (Tugas) atau locked (Acara) */}
      {isAcara ? (
        <TaskPreviewField label="Deadline">
          <div className="flex items-center gap-2 rounded-[8px] border border-[rgba(33,33,33,0.08)] bg-[#f0efee] px-3 py-1.75">
            <span className="text-[13px] text-[#5d5d5a]/40">–</span>
            <span className="text-[13px] text-[#5d5d5a]/40">Tidak ada deadline untuk acara</span>
          </div>
        </TaskPreviewField>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <TaskPreviewField label="Deadline Tanggal">
            <DateInputField value={deadlineDate} onChange={handleDeadlineDateChange} />
          </TaskPreviewField>
          <TaskPreviewField label="Deadline Jam">
            <TimeInputField value={deadlineTime} onChange={handleDeadlineTimeChange} />
          </TaskPreviewField>
        </div>
      )}

      {/* Row 4: Kategori | Prioritas sejajar */}
      <div className="grid grid-cols-2 gap-2">
        <TaskPreviewField label="Kategori">
          <ChipToggle<ParsedCategory>
            value={result.category}
            options={["Akademik", "Kerja", "Personal", "Lainnya"]}
            styleMap={CATEGORY_STYLE}
            onChange={(v) => onEdit({ category: v })}
          />
        </TaskPreviewField>
        <TaskPreviewField label="Prioritas">
          <ChipToggle<ParsedPriority>
            value={result.priority}
            options={["Tinggi", "Sedang", "Rendah"]}
            styleMap={PRIORITY_STYLE}
            onChange={(v) => onEdit({ priority: v })}
          />
        </TaskPreviewField>
      </div>

      <p className="text-[11px] font-normal italic text-[#6b6b6b]">
        {result.rescheduled
          ? "Waktu sudah disesuaikan otomatis agar tidak bentrok."
          : "AI akan mendeteksi dan mengisi detail secara otomatis."}
      </p>
    </div>
  );
}