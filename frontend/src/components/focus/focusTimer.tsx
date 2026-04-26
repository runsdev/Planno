"use client";

import { Play, Pause } from "lucide-react";
import { FocusPhase } from "./focusModal";

interface FocusTimerProps {
  secondsLeft: number;
  phase: FocusPhase;
  isRunning: boolean;
  onTogglePlay: () => void;
  disabled?: boolean;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function FocusTimer({ secondsLeft, phase, isRunning, onTogglePlay, disabled }: FocusTimerProps) {
  const isFocus    = phase === "focus";
  const phaseLabel = isFocus ? "Sesi Fokus" : "Sesi Istirahat";
  const phaseColor = isFocus ? "text-[#e07b72]" : "text-[#6bab7e]";

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <span className={`text-[52px] font-bold leading-none tracking-tight tabular-nums transition-colors ${disabled ? "text-[#5d5d5a]/20" : "text-[#212121]"}`}>
        {formatTime(secondsLeft)}
      </span>
      <span className={`text-[12px] font-semibold ${disabled ? "text-[#5d5d5a]/30" : phaseColor}`}>
        {phaseLabel}
      </span>
      <button
        type="button"
        onClick={onTogglePlay}
        disabled={disabled}
        className={`mt-1 w-9.5 h-9.5 flex items-center justify-center rounded-full transition-colors cursor-pointer shadow-sm
          ${disabled
            ? "bg-[rgba(93,93,90,0.12)] cursor-not-allowed"
            : "bg-[#4a4a47] hover:bg-[#333331]"
          }`}
      >
        {isRunning
          ? <Pause className={`w-4 h-4 ${disabled ? "fill-[#5d5d5a]/30" : "fill-white"}`} />
          : <Play  className={`w-4 h-4 ml-0.5 ${disabled ? "fill-[#5d5d5a]/30" : "fill-white"}`} />
        }
      </button>
    </div>
  );
}