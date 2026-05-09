"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { TaskInputStep } from "./taskInputStep";
import { TaskPreviewStep } from "./taskPreviewStep";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
export type ParsedType = "Tugas" | "Acara";
export type ParsedCategory = "Akademik" | "Kerja" | "Personal" | "Lainnya";
export type ParsedPriority = "Tinggi" | "Sedang" | "Rendah";

export interface ParsedResult {
  type: ParsedType;
  title: string;
  deadline: string;
  duration: string;
  category: ParsedCategory;
  priority: ParsedPriority;
}

type Step = "input" | "preview";

// ─── Mapping helpers ──────────────────────────────────────────────────────────

function mapCategory(backendCat: string | null | undefined): ParsedCategory {
  const map: Record<string, ParsedCategory> = {
    academic: "Akademik",
    work: "Kerja",
    personal: "Personal",
    health: "Lainnya",
  };
  return map[backendCat ?? ""] ?? "Lainnya";
}

function mapQuadrantToPriority(quadrant: string): ParsedPriority {
  if (quadrant === "DO_FIRST") return "Tinggi";
  if (quadrant === "SCHEDULE") return "Sedang";
  return "Rendah";
}

function formatDuration(mins: number | null | undefined): string {
  if (!mins) return "~1 jam";
  if (mins < 60) return `~${mins} mnt`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `~${h} jam ${m} mnt` : `~${h} jam`;
}

function formatDeadline(deadline: string | null | undefined): string {
  if (!deadline) return "Tidak ditentukan";
  try {
    const dt = new Date(deadline.replace(" ", "T"));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dDay = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    const diffDays = Math.round(
      (dDay.getTime() - today.getTime()) / 86_400_000,
    );
    const hasTime = deadline.includes(":");
    const timeStr = hasTime
      ? ` ${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`
      : "";
    if (diffDays < 0) return `Terlambat${timeStr}`;
    if (diffDays === 0) return `Hari ini${timeStr}`;
    if (diffDays === 1) return `Besok${timeStr}`;
    if (diffDays <= 7) return `${diffDays} hari lagi${timeStr}`;
    return deadline;
  } catch {
    return deadline;
  }
}

// ─── Real AI parser ───────────────────────────────────────────────────────────

async function parseWithAI(input: string): Promise<ParsedResult> {
  const parsed = await api.parseTask(input);
  if (!parsed.success) throw new Error(parsed.error ?? "Gagal memproses input");

  const category = mapCategory(parsed.category);
  const importanceMap: Record<ParsedCategory, string> = {
    Akademik: "high",
    Kerja: "high",
    Personal: "medium",
    Lainnya: "low",
  };

  const scored = await api.scoreTask({
    deadline: parsed.deadline,
    importance: importanceMap[category],
    duration_minutes: parsed.duration_minutes,
    reschedule_count: 0,
  });

  return {
    type: "Tugas",
    title: parsed.title ?? input,
    deadline: formatDeadline(parsed.deadline),
    duration: formatDuration(parsed.duration_minutes),
    category,
    priority: mapQuadrantToPriority(scored.quadrant),
  };
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  // TODO: wire this up to actual task/event store
  onSave: (result: ParsedResult) => void;
}

export function AddTaskModal({ open, onClose, onSave }: AddTaskModalProps) {
  const [step, setStep] = useState<Step>("input");
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset state setiap modal dibuka
  useEffect(() => {
    if (open) {
      setStep("input");
      setInput("");
      setParsed(null);
      setIsParsing(false);
      setParseError(null);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleParse = async () => {
    if (!input.trim() || isParsing) return;
    setIsParsing(true);
    setParseError(null);
    try {
      const result = await parseWithAI(input);
      setParsed(result);
      setStep("preview");
    } catch (err) {
      setParseError(
        err instanceof Error ? err.message : "Gagal memproses. Coba lagi.",
      );
    } finally {
      setIsParsing(false);
    }
  };

  const handleSave = () => {
    if (!parsed) return;
    onSave(parsed);
    onClose();
  };

  const handleEdit = (field: keyof ParsedResult, value: string) => {
    if (!parsed) return;
    setParsed({ ...parsed, [field]: value });
  };

  return (
    // Overlay
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Modal card */}
      <div
        className="relative bg-white rounded-[18px] shadow-[0px_8px_32px_0px_rgba(33,33,33,0.16)] w-full max-w-120 mx-4 flex flex-col overflow-hidden"
        style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-[18px] font-semibold text-[#212121]">
            Tambah Dengan AI
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[#5d5d5a]/50 hover:bg-[#5d5d5a]/10 hover:text-[#5d5d5a] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 flex flex-col gap-4">
          {/* Input always visible */}
          <TaskInputStep
            value={input}
            onChange={setInput}
            onSubmit={handleParse}
            isParsing={isParsing}
            hasResult={step === "preview"}
          />

          {/* Preview shown after parse */}
          {step === "preview" && parsed && (
            <TaskPreviewStep result={parsed} onEdit={handleEdit} />
          )}

          {/* Error message */}
          {parseError && (
            <p className="text-[12.25px] font-medium text-[#e07b72]">
              {parseError}
            </p>
          )}

          {/* Helper text */}
          {!parseError && (
            <p className="text-[12.25px] font-normal text-[#6b6b6b]">
              AI akan mendeteksi apakah ini tugas atau acara, lalu mengisi
              detailnya otomatis.
            </p>
          )}

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
              onClick={step === "input" ? handleParse : handleSave}
              disabled={!input.trim() || isParsing}
              className={`h-9 px-5 rounded-[10.5px] text-[13px] font-semibold transition-all cursor-pointer
                ${
                  input.trim() && !isParsing
                    ? "bg-[#4a4a47] text-[#f8f6f5] hover:bg-[#333331]"
                    : "bg-[rgba(93,93,90,0.12)] text-[#5d5d5a]/40 cursor-not-allowed"
                }`}
            >
              {isParsing
                ? "Memproses..."
                : step === "preview"
                  ? "Simpan"
                  : "Lanjut"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
