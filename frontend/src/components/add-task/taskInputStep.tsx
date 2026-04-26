"use client";

import { Loader2 } from "lucide-react";

interface TaskInputStepProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  isParsing: boolean;
  hasResult: boolean;
}

export function TaskInputStep({
  value, onChange, onSubmit, isParsing, hasResult,
}: TaskInputStepProps) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          // Submit on Enter (without Shift)
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={`Ketik tugas atau acara... cth: 'kerjakan laporan besok jam 23:59' atau 'kuliah senpro Senin jam 10'`}
        rows={3}
        disabled={isParsing || hasResult}
        className={`w-full resize-none rounded-[12px] border border-[rgba(33,33,33,0.12)] px-4 py-3 text-[13px] text-[#212121] placeholder:text-[#5d5d5a]/40 outline-none transition-colors leading-5
          ${isParsing || hasResult
            ? "bg-[#f8f6f5] text-[#5d5d5a]/60 cursor-not-allowed"
            : "bg-white focus:border-[rgba(93,93,90,0.4)]"
          }`}
      />
      {isParsing && (
        <div className="absolute right-3 bottom-3">
          <Loader2 className="w-4 h-4 text-[#5d5d5a]/50 animate-spin" />
        </div>
      )}
    </div>
  );
}