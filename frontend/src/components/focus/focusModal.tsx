"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { FocusTimer } from "./focusTimer";
import { FocusSessionDots } from "./focusSessionDots";
import { FocusTaskSearch } from "./focusTaskSearch";

export type FocusPhase = "focus" | "break";
export type SessionPreset = { label: string; focusMin: number; breakMin: number };
export type FocusTask = { id: number; title: string; priority: "Tinggi" | "Sedang" | "Rendah" };

export const SESSION_PRESETS: SessionPreset[] = [
  { label: "Fokus 25", focusMin: 25, breakMin: 10 },
  { label: "Fokus 50", focusMin: 50, breakMin: 10 },
  { label: "Fokus 90", focusMin: 90, breakMin: 10 },
];

export const MOCK_TASKS: FocusTask[] = [
  { id: 1, title: "Kerjakan Laporan Capstone", priority: "Tinggi" },
  { id: 2, title: "Belajar Statistik UTS",     priority: "Tinggi" },
  { id: 3, title: "Meeting Tim KKN",           priority: "Sedang" },
  { id: 4, title: "Presentasi Seminar KP",     priority: "Tinggi" },
  { id: 5, title: "Beli perlengkapan tugas",   priority: "Rendah" },
  { id: 6, title: "Telepon mama",              priority: "Rendah" },
  { id: 7, title: "Review kode teman",         priority: "Sedang" },
];

interface FocusModalProps {
  open: boolean;
  onClose: () => void;
  onMarkComplete: (taskId: number, totalSeconds: number) => void;
  taskProgress: Record<number, { completedSessions: number; totalFocusSeconds: number }>;
  onSessionFinished: (taskId: number, addedSeconds: number) => void;
  completedTaskIds: number[];
}

export function FocusModal({
  open,
  onClose,
  onMarkComplete,
  taskProgress,
  onSessionFinished,
  completedTaskIds,
}: FocusModalProps) {
  const [preset, setPreset]                   = useState<SessionPreset>(SESSION_PRESETS[0]);
  const [phase, setPhase]                     = useState<FocusPhase>("focus");
  const [secondsLeft, setSecondsLeft]         = useState(SESSION_PRESETS[0].focusMin * 60);
  const [isRunning, setIsRunning]             = useState(false);
  const [selectedTask, setSelectedTask]       = useState<FocusTask | null>(null);
  const [currentSessionSeconds, setCurrentSessionSeconds] = useState(0);
  const overlayRef                            = useRef<HTMLDivElement>(null);

  // Progress task yang dipilih — dibaca dari luar (persists antar buka-tutup)
  const progress = selectedTask
    ? (taskProgress[selectedTask.id] ?? { completedSessions: 0, totalFocusSeconds: 0 })
    : { completedSessions: 0, totalFocusSeconds: 0 };

  // Reset timer state saat modal pertama kali dibuka
  useEffect(() => {
    if (open) {
      setPhase("focus");
      setSecondsLeft(preset.focusMin * 60);
      setIsRunning(false);
      setCurrentSessionSeconds(0);
      // selectedTask TIDAK direset agar user bisa lanjut task yang sama
    }
  }, [open]);

  // ─── Fix utama ───────────────────────────────────────────────────────────────
  // Setiap kali task BERGANTI → reset semua timer state ke awal
  // Sehingga Tugas B selalu mulai dari sesi 1 dan timer fresh
  const prevTaskIdRef = useRef<number | null>(null);
  useEffect(() => {
    const newId = selectedTask?.id ?? null;

    // Hanya reset jika task benar-benar berganti (bukan saat mount)
    if (prevTaskIdRef.current !== null && prevTaskIdRef.current !== newId) {
      setPreset(SESSION_PRESETS[0]);
      setPhase("focus");
      setSecondsLeft(SESSION_PRESETS[0].focusMin * 60);
      setIsRunning(false);
      setCurrentSessionSeconds(0);
    }

    prevTaskIdRef.current = newId;
  }, [selectedTask?.id]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  const handlePhaseEnd = useCallback(() => {
    setIsRunning(false);
    if (phase === "focus") {
      if (selectedTask) onSessionFinished(selectedTask.id, currentSessionSeconds);
      setCurrentSessionSeconds(0);
      setPhase("break");
      setSecondsLeft(preset.breakMin * 60);
    } else {
      setPhase("focus");
      setSecondsLeft(preset.focusMin * 60);
    }
  }, [phase, preset, selectedTask, currentSessionSeconds, onSessionFinished]);

  // Countdown tick
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(id); handlePhaseEnd(); return 0; }
        return s - 1;
      });
      if (phase === "focus") setCurrentSessionSeconds((t) => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, phase, handlePhaseEnd]);

  // Jika task yang sedang dipilih ternyata sudah di-complete dari kanban,
  // otomatis deselect agar user tidak bisa lanjut timer task yang sudah selesai
  useEffect(() => {
    if (selectedTask && completedTaskIds.includes(selectedTask.id)) {
      setSelectedTask(null);
      setIsRunning(false);
      setPhase("focus");
      setSecondsLeft(preset.focusMin * 60);
      setCurrentSessionSeconds(0);
    }
  }, [completedTaskIds, selectedTask?.id]);

  const handleTogglePlay = () => {
    // Tidak bisa mulai timer jika tidak ada task dipilih
    if (!selectedTask) return;
    setIsRunning((r) => !r);
  };

  const handlePresetChange = (p: SessionPreset) => {
    setPreset(p);
    setPhase("focus");
    setSecondsLeft(p.focusMin * 60);
    setIsRunning(false);
    setCurrentSessionSeconds(0);
  };

  const handleFinishSession = () => {
    setIsRunning(false);
    if (phase === "focus") {
      if (selectedTask) onSessionFinished(selectedTask.id, currentSessionSeconds);
      setCurrentSessionSeconds(0);
      setPhase("break");
      setSecondsLeft(preset.breakMin * 60);
    } else {
      setPhase("focus");
      setSecondsLeft(preset.focusMin * 60);
    }
  };

  const handleMarkDone = () => {
    setIsRunning(false);
    if (selectedTask) {
      // Total = akumulasi dari luar + detik sesi yang sedang berjalan sekarang
      const totalSeconds = progress.totalFocusSeconds + currentSessionSeconds;
      onMarkComplete(selectedTask.id, totalSeconds);
    }
    onClose();
  };

  const canMarkDone    = !!selectedTask && progress.completedSessions > 0;
  const canStartTimer  = !!selectedTask;

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="relative bg-white rounded-[18px] shadow-[0px_8px_32px_0px_rgba(33,33,33,0.16)] w-full max-w-90 mx-4 flex flex-col overflow-hidden"
        style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-[16px] font-semibold text-[#212121]">Mode Fokus</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[#5d5d5a]/50 hover:bg-[#5d5d5a]/10 hover:text-[#5d5d5a] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pb-5 flex flex-col gap-4">
          <FocusTaskSearch
            tasks={MOCK_TASKS}
            selected={selectedTask}
            onSelect={setSelectedTask}
            completedTaskIds={completedTaskIds}
          />

          {/* Hint jika belum pilih task */}
          {!selectedTask && (
            <p className="text-[11px] font-normal text-[#5d5d5a]/50 text-center -mt-1">
              Pilih tugas terlebih dahulu untuk memulai timer.
            </p>
          )}

          <FocusTimer
            secondsLeft={secondsLeft}
            phase={phase}
            isRunning={isRunning}
            onTogglePlay={handleTogglePlay}
            disabled={!canStartTimer}
          />

          <div className="flex gap-2">
            {SESSION_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handlePresetChange(p)}
                className={`flex-1 h-7.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer
                  ${preset.label === p.label
                    ? "bg-[#5d5d5a] text-[#f8f6f5] border-[#5d5d5a]"
                    : "bg-white text-[#5d5d5a]/60 border-[rgba(93,93,90,0.2)] hover:border-[rgba(93,93,90,0.4)]"
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Dots = sesi selesai milik task yang sedang dipilih */}
          <FocusSessionDots completedSessions={progress.completedSessions} />

          <button
            type="button"
            onClick={handleFinishSession}
            disabled={!selectedTask}
            className={`w-full h-10 rounded-[10.5px] text-[13px] font-semibold border transition-colors cursor-pointer
              ${selectedTask
                ? phase === "focus"
                  ? "bg-white border-[#e07b72] text-[#e07b72] hover:bg-[#fdecea]"
                  : "bg-white border-[#6bab7e] text-[#6bab7e] hover:bg-[rgba(222,241,208,0.4)]"
                : "bg-white border-[rgba(93,93,90,0.15)] text-[#5d5d5a]/30 cursor-not-allowed"
              }`}
          >
            {phase === "focus" ? "Selesaikan Sesi Fokus" : "Selesaikan Istirahat"}
          </button>

          <button
            type="button"
            onClick={handleMarkDone}
            disabled={!canMarkDone}
            className={`w-full h-10 rounded-[10.5px] text-[13px] font-semibold transition-colors cursor-pointer
              ${canMarkDone
                ? "bg-[#4a4a47] text-[#f8f6f5] hover:bg-[#333331]"
                : "bg-[rgba(93,93,90,0.12)] text-[#5d5d5a]/40 cursor-not-allowed"
              }`}
          >
            Tandai Selesai
          </button>
        </div>
      </div>
    </div>
  );
}