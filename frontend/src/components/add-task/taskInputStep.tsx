"use client";

import { Loader2, AlertCircle } from "lucide-react";

interface TaskInputStepProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  isParsing: boolean;
  hasResult: boolean;
  error?: string | null;
}

export function TaskInputStep({
  value, onChange, onSubmit, isParsing, hasResult, error,
}: TaskInputStepProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder={`Ketik tugas atau acara... cth: 'kerjakan laporan besok jam 16.00 sampai 18.00' atau 'kuliah statistika Senin jam 10'`}
          rows={3}
          disabled={isParsing || hasResult}
          className={`w-full resize-none rounded-[12px] border px-4 py-3 text-[13px] text-[#212121] placeholder:text-[#5d5d5a]/40 outline-none transition-colors leading-5
            ${error
              ? "border-red-400 bg-red-50"
              : isParsing || hasResult
                ? "border-[rgba(33,33,33,0.12)] bg-[#f8f6f5] text-[#5d5d5a]/60 cursor-not-allowed"
                : "border-[rgba(33,33,33,0.12)] bg-white focus:border-[rgba(93,93,90,0.4)]"
            }`}
        />
        {isParsing && (
          <div className="absolute right-3 bottom-3">
            <Loader2 className="w-4 h-4 text-[#5d5d5a]/50 animate-spin" />
          </div>
        )}
      </div>

      {/* Pesan error dari AI */}
      {error && (
        <div className="flex items-start gap-2 px-1">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-[12px] text-red-500 leading-5">{error}</p>
        </div>
      )}
    </div>
  );
}