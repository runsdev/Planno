"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { TaskInputStep } from "./taskInputStep";
import { TaskPreviewStep } from "./taskPreviewStep";

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

// ─── Mock AI parser (swap with real AI call later) ───────────────────────────
// TODO: Replace this with actual AI API call
// Expected input: raw user string
// Expected output: ParsedResult
async function mockParseWithAI(input: string): Promise<ParsedResult> {
  await new Promise((r) => setTimeout(r, 900)); // simulate latency

  const lower = input.toLowerCase();
  const isEvent =
    lower.includes("kuliah") ||
    lower.includes("meeting") ||
    lower.includes("rapat") ||
    lower.includes("seminar") ||
    lower.includes("kelas");

  const isKerja =
    lower.includes("meeting") ||
    lower.includes("rapat") ||
    lower.includes("kerja") ||
    lower.includes("kantor") ||
    lower.includes("pkl");

  const isPersonal =
    lower.includes("telepon") ||
    lower.includes("jalan") ||
    lower.includes("makan") ||
    lower.includes("gym");

  const isAkademik =
    lower.includes("kuliah") ||
    lower.includes("tugas") ||
    lower.includes("laporan") ||
    lower.includes("belajar") ||
    lower.includes("uts") ||
    lower.includes("seminar") ||
    lower.includes("kelas");

  const isTinggi =
    lower.includes("besok") ||
    lower.includes("23:59") ||
    lower.includes("urgent") ||
    lower.includes("deadline");

  const isSedang =
    lower.includes("senin") ||
    lower.includes("selasa") ||
    lower.includes("rabu") ||
    lower.includes("minggu");

  const deadlineMatch =
    lower.match(/besok(?: jam ([\d:]+))?/) ||
    lower.match(/(senin|selasa|rabu|kamis|jumat|sabtu|minggu)/);

  const durasiMatch = lower.match(/(\d+)\s*jam/);

  return {
    type: isEvent ? "Acara" : "Tugas",
    title: input
      .replace(/besok.*|senin.*|selasa.*|jam\s[\d:]+.*/gi, "")
      .trim()
      .replace(/^\w/, (c) => c.toUpperCase()),
    deadline: deadlineMatch
      ? deadlineMatch[0].charAt(0).toUpperCase() + deadlineMatch[0].slice(1)
      : "Tidak ditentukan",
    duration: durasiMatch ? `~${durasiMatch[1]} jam` : "~1 jam",
    category: isKerja
      ? "Kerja"
      : isPersonal
      ? "Personal"
      : isAkademik
      ? "Akademik"
      : "Lainnya",
    priority: isTinggi ? "Tinggi" : isSedang ? "Sedang" : "Rendah",
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
  const [step, setStep]           = useState<Step>("input");
  const [input, setInput]         = useState("");
  const [parsed, setParsed]       = useState<ParsedResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const overlayRef                = useRef<HTMLDivElement>(null);

  // Reset state setiap modal dibuka
  useEffect(() => {
    if (open) {
      setStep("input");
      setInput("");
      setParsed(null);
      setIsParsing(false);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleParse = async () => {
    if (!input.trim() || isParsing) return;
    setIsParsing(true);
    try {
      // TODO: swap mockParseWithAI with real AI service call
      const result = await mockParseWithAI(input);
      setParsed(result);
      setStep("preview");
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
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Modal card */}
      <div
        className="relative bg-white rounded-[18px] shadow-[0px_8px_32px_0px_rgba(33,33,33,0.16)] w-full max-w-120 mx-4 flex flex-col overflow-hidden"
        style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-[18px] font-semibold text-[#212121]">Tambah Dengan AI</h2>
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

          {/* Helper text */}
          <p className="text-[12.25px] font-normal text-[#6b6b6b]">
            AI akan mendeteksi apakah ini tugas atau acara, lalu mengisi detailnya otomatis.
          </p>

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
                ${input.trim() && !isParsing
                  ? "bg-[#4a4a47] text-[#f8f6f5] hover:bg-[#333331]"
                  : "bg-[rgba(93,93,90,0.12)] text-[#5d5d5a]/40 cursor-not-allowed"
                }`}
            >
              {isParsing ? "Memproses..." : step === "preview" ? "Simpan" : "Lanjut"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}