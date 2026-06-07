"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { TaskInputStep } from "./taskInputStep";
import { TaskPreviewStep } from "./taskPreviewStep";
import { api } from "@/lib/api";
import { formatDeadline } from "@/lib/utils";
import { validateTaskInput } from "./validateTaskInput";

export type ParsedType     = "Tugas" | "Acara";
export type ParsedCategory = "Akademik" | "Kerja" | "Personal" | "Lainnya";
export type ParsedPriority = "Tinggi" | "Sedang" | "Rendah";

export interface ParsedResult {
  type            : ParsedType;
  title           : string;
  deadline        : string;
  deadlineISO     : string | null;
  startISO        : string | null; 
  duration        : string;
  category        : ParsedCategory;
  priority        : ParsedPriority;
  rescheduled     ?: boolean;
  originalDeadline?: string;
  tanggal_kegiatan?: string;
}

type Step = "input" | "preview";

function mapCategory(cat: string | null | undefined): ParsedCategory {
  const map: Record<string, ParsedCategory> = {
    academic: "Akademik", work: "Kerja", personal: "Personal", health: "Lainnya",
  };
  return map[cat ?? ""] ?? "Lainnya";
}

function formatDuration(mins: number | null | undefined): string {
  if (!mins) return "~1 jam";
  if (mins < 60) return `~${mins} mnt`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `~${h} jam ${m} mnt` : `~${h} jam`;
}

function isToday(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  const d = new Date(dateString);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() &&
         d.getMonth()    === n.getMonth()    &&
         d.getDate()     === n.getDate();
}

function getClientNow() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

async function parseWithAI(input: string, occupiedSlots: Array<{ start: string; end: string }> = []): Promise<ParsedResult> {
  const parsed = await api.parseTask(input, getClientNow());
  if (!parsed.success) throw new Error(parsed.error ?? "Gagal parsing");

  const category = mapCategory(parsed.category);
  const pad        = (n: number) => String(n).padStart(2, "0");
  const durationMs = (parsed.duration_minutes ?? 60) * 60_000;

  let deadlineISO      = parsed.deadline ?? null;
  let rescheduled      = false;
  let originalDeadline : string | undefined;

  // Gunakan tanggal_kegiatan dari AI, fallback ke tanggal deadline, fallback ke hari ini
  let tglKegiatanRaw = (parsed as any).tanggal_kegiatan || (parsed.deadline ? parsed.deadline.split(" ")[0] : getClientNow().split(" ")[0]);

  // ─── PERBAIKAN UTAMA 1: HITUNG SKOR MENGGUNAKAN DEADLINE ISO ASLI ───────────
  const scored = await api.scoreTask({
    deadline         : deadlineISO, // Kirim format ISO murni (YYYY-MM-DD HH:mm), BUKAN format tampilan UI!
    importance       : category === "Akademik" || category === "Kerja" ? "high" : category === "Personal" ? "medium" : "low",
    duration_minutes : parsed.duration_minutes ?? 60,
    reschedule_count : 0,
    category         : parsed.category,
    type             : parsed.type,
    client_now       : getClientNow(),
  });

  if (parsed.deadline && parsed.jam_mulai && occupiedSlots.length > 0) {
    try {
      const deadlineDt    = new Date(parsed.deadline.replace(" ", "T"));
      const startDt       = new Date(deadlineDt.getTime() - durationMs);
      const proposedStart = `${startDt.getFullYear()}-${pad(startDt.getMonth()+1)}-${pad(startDt.getDate())} ${pad(startDt.getHours())}:${pad(startDt.getMinutes())}`;

      const slotCheck = await api.checkSlot({
        proposed_start   : proposedStart,
        duration_minutes : parsed.duration_minutes ?? 60,
        occupied_slots   : occupiedSlots,
      });

      if (slotCheck.has_conflict && slotCheck.suggested_start) {
        originalDeadline = parsed.deadline;
        const newStart   = new Date(slotCheck.suggested_start.replace(" ", "T"));
        const newEnd     = new Date(newStart.getTime() + durationMs);
        deadlineISO      = `${newEnd.getFullYear()}-${pad(newEnd.getMonth()+1)}-${pad(newEnd.getDate())} ${pad(newEnd.getHours())}:${pad(newEnd.getMinutes())}`;
        rescheduled      = true;
      }
    } catch { /* silent */ }
  }

  // ─── PERBAIKAN LOGIKA START_ISO ─────────────────────────────────────────────
  let startISO: string | null = null;
  if (parsed.jam_mulai) {
    startISO = `${tglKegiatanRaw} ${parsed.jam_mulai}`;
  } else if (deadlineISO) {
    const endDt   = new Date(deadlineISO.replace(" ", "T"));
    const startDt = new Date(endDt.getTime() - durationMs);
    startISO = `${startDt.getFullYear()}-${pad(startDt.getMonth()+1)}-${pad(startDt.getDate())} ${pad(startDt.getHours())}:${pad(startDt.getMinutes())}`;
  }

  return {
    type            : (parsed.type === "Tugas" || parsed.type === "Acara" ? parsed.type : "Tugas") as ParsedType,
    title           : parsed.title ?? input,
    deadline        : formatDeadline(deadlineISO), // Ini baru diubah ke format UI di paling akhir
    deadlineISO,
    startISO,
    duration        : formatDuration(parsed.duration_minutes),
    category,
    priority        : (isToday(deadlineISO) ? "Tinggi" : (scored.priority_label === "high" || scored.priority_label === "Tinggi" ? "Tinggi" : scored.priority_label === "medium" || scored.priority_label === "Sedang" ? "Sedang" : "Rendah")) as ParsedPriority,
    rescheduled,
    originalDeadline,
    tanggal_kegiatan: tglKegiatanRaw,
  };
}

interface Props {
  open          : boolean;
  onClose       : () => void;
  onSave        : (r: ParsedResult) => void;
  occupiedSlots ?: Array<{ start: string; end: string }>;
}

export function AddTaskModal({ open, onClose, onSave, occupiedSlots = [] }: Props) {
  const [step,      setStep]      = useState<Step>("input");
  const [input,     setInput]     = useState("");
  const [parsed,    setParsed]    = useState<ParsedResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const overlayRef   = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  useEffect(() => { return () => { isMountedRef.current = false; }; }, []);

  useEffect(() => {
    if (open) { setStep("input"); setInput(""); setParsed(null); setIsParsing(false); setError(null); }
  }, [open]);

  const handleParse = async () => {
    if (isParsing || !input.trim()) return;

    const validationError = validateTaskInput(input);
    if (validationError) { setError(validationError); return; }

    try {
      setIsParsing(true);
      setError(null);
      const result = await parseWithAI(input, occupiedSlots);
      if (!isMountedRef.current) return;
      setParsed(result);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses");
    } finally {
      if (isMountedRef.current) setIsParsing(false);
    }
  };

  const handleSave = () => {
    if (!parsed) return;
    onSave(parsed);
    onClose();
  };

  const handleEdit = (updates: Partial<ParsedResult>) => {
    setParsed((prev) => prev ? { ...prev, ...updates } : null);
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
      onClick={(e) => { 
        // Memastikan klik benar-benar terjadi pada area overlay luar, bukan modal card
        if (e.target === overlayRef.current) onClose(); 
      }}
    >
      {/* Modal card — tetap mempertahankan desain dan pembatalan event bubble */}
      <div
        className="relative bg-white rounded-[18px] shadow-[0px_8px_32px_0px_rgba(33,33,33,0.16)] w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]"
        style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}
        onClick={(e) => e.stopPropagation()} 
      >

        {/* Header — sticky */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-[18px] font-semibold text-[#212121]">Tambah Dengan AI</h2>
          <button type="button" onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[#5d5d5a]/50 hover:bg-[#5d5d5a]/10 hover:text-[#5d5d5a] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="px-6 pb-6 flex flex-col gap-4 overflow-y-auto">
          <TaskInputStep
            value={input}
            onChange={(v) => { setInput(v); if (error) setError(null); }}
            onSubmit={handleParse}
            isParsing={isParsing}
            hasResult={step === "preview"}
            error={error}
          />

          {step === "preview" && parsed && (
            <TaskPreviewStep result={parsed} onEdit={handleEdit} />
          )}

          {!error && (
            <p className="text-[12.25px] font-normal text-[#6b6b6b]">
              AI akan mendeteksi apakah ini tugas atau acara, lalu mengisi detailnya otomatis.
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="h-9 px-4 text-[13px] font-medium text-[#5d5d5a] hover:text-[#212121] transition-colors cursor-pointer"
            >Batal</button>

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