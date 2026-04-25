"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ToggleGroup } from "@/components/ui/toggleGroup";
import { TimeRangeInput } from "@/components/ui/timeRangeInput";
import { Sparkles } from "lucide-react";

// ─── Flower SVG ───────────────────────────────────────────────────────────────
function Flower({
  size,
  fill,
  rotate = 0,
  className,
}: {
  size: number;
  fill: string;
  rotate?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden
    >
      <g transform={`translate(50,50) rotate(${rotate})`}>
        {[0, 90, 180, 270].map((deg) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-22"
            rx="21"
            ry="24"
            fill={fill}
            transform={`rotate(${deg})`}
          />
        ))}
        <circle cx="0" cy="0" r="14" fill="#f8f6f5" />
      </g>
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Preferences = {
  focusTime: string;
  workStyle: string;
  workHours: { start: string; end: string };
  focusDuration: string;
  taskType: string;
};

const defaultPreferences: Preferences = {
  focusTime: "",
  workStyle: "",
  workHours: { start: "", end: "" },
  focusDuration: "",
  taskType: "",
};

// ─── Onboarding Page ──────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const isComplete =
    preferences.focusTime !== "" &&
    preferences.workStyle !== "" &&
    preferences.focusDuration !== "" &&
    preferences.taskType !== "";

  const handleSubmit = () => {
    if (!isComplete || isSubmitting) return;
    setIsSubmitting(true);

    // TODO: simpan ke API / localStorage / context
    // Contoh: localStorage.setItem("planno_preferences", JSON.stringify(preferences));

    setTimeout(() => {
      router.push("/planner");
    }, 800);
  };

  return (
    <div
      className="relative min-h-screen bg-[#f8f6f5] overflow-hidden flex items-center justify-center"
      style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}
    >
      {/* ── Decorative flowers ── */}
        {/* Top-right: large pink flower */}
        <div className="absolute -top-15 -right-15 pointer-events-none z-0">
            <Flower size={400} fill="#fce4e4" rotate={30} />
        </div>

        {/* Top-right: small blue flower */}
        <div className="absolute top-7.5 right-80 pointer-events-none z-10">
            <Flower size={100} fill="#d1ecf1" rotate={65} />
        </div>

        {/* Bottom-left: large pink flower */}
        <div className="absolute -bottom-15 -left-15 pointer-events-none z-0">
            <Flower size={400} fill="#fce4e4" rotate={30}  />
        </div>

        {/* Bottom-left: small blue flower */}
        <div className="absolute bottom-7.5 left-80 pointer-events-none z-10">
            <Flower size={100} fill="#d1ecf1" rotate={65} />
        </div>

      {/* ── Card ── */}
      <div className="relative z-10 w-full max-w-220.5 mx-6 flex flex-col gap-6 py-12">

        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-[40px] font-bold italic text-[#5d5d5a] leading-none">
            planno
          </h1>
          <p className="text-base font-normal text-[#6b6b6b]">
            Selamat datang! Mari kenalan dulu sebelum mulai.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-[14.5px] shadow-[0px_4px_16px_0px_rgba(33,33,33,0.08)] px-7 py-7 flex flex-col gap-7">

          {/* AI badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#4a6fa5] bg-[rgba(205,235,241,0.5)] border-[1.5px] border-[#4a6fa5] rounded-full px-3.5 py-1">
              <Sparkles className="w-3 h-3" />
              Sesuaikan AI untukmu
            </span>
          </div>

          <p className="text-[13px] font-normal text-[#6b6b6b] -mt-3">
            Jawab beberapa pertanyaan singkat berikut agar AI planno bisa membantumu dengan lebih tepat. Kamu bisa mengubahnya kapan saja dari halaman Pengaturan.
          </p>

          {/* Divider */}
          <div className="h-px bg-[rgba(93,93,90,0.12)]" />

          {/* Pertanyaan 1 */}
          <ToggleGroup
            label="Kamu biasanya paling produktif di jam berapa?"
            options={[
              { label: "7-10 pagi", value: "7-10 pagi" },
              { label: "10-14 siang", value: "10-14 siang" },
              { label: "14-18 siang", value: "14-18 siang" },
              { label: "18-22 malam", value: "18-22 malam" },
            ]}
            value={preferences.focusTime}
            onChange={(val) => handleChange("focusTime", val)}
          />

          {/* Pertanyaan 2 */}
          <ToggleGroup
            label="Bagaimana kamu lebih suka mengerjakan tugas?"
            options={[
              { label: "Deep focus", value: "Deep focus" },
              { label: "Multitasking", value: "Multitasking" },
              { label: "Bergantian", value: "Bergantian" },
            ]}
            value={preferences.workStyle}
            onChange={(val) => handleChange("workStyle", val)}
          />

          {/* Pertanyaan 3 */}
          <TimeRangeInput
            label="Dari jam berapa hingga jam berapa kamu biasanya aktif?"
            value={preferences.workHours}
            onChange={(val) => handleChange("workHours", val)}
          />

          {/* Pertanyaan 4 */}
          <ToggleGroup
            label="Berapa lama kamu bisa fokus tanpa terganggu?"
            options={[
              { label: "30 menit", value: "30" },
              { label: "1 jam", value: "60" },
              { label: "2 jam", value: "120" },
            ]}
            value={preferences.focusDuration}
            onChange={(val) => handleChange("focusDuration", val)}
          />

          {/* Pertanyaan 5 */}
          <ToggleGroup
            label="Kamu lebih sering mengerjakan tugas seperti apa?"
            options={[
              { label: "Langsung sebelum deadline", value: "last-minute" },
              { label: "Dicicil jauh hari", value: "early" },
            ]}
            value={preferences.taskType}
            onChange={(val) => handleChange("taskType", val)}
          />

          {/* Divider */}
          <div className="h-px bg-[rgba(93,93,90,0.12)]" />

          {/* Submit */}
          <div className="flex flex-col items-end gap-2">
            {!isComplete && (
              <p className="text-[11px] font-normal text-[#6b6b6b]/70 self-start">
                Jawab semua pertanyaan untuk melanjutkan.
              </p>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isComplete || isSubmitting}
              className={`h-9 px-6 rounded-[10.5px] text-[12.25px] font-semibold transition-colors cursor-pointer
                ${isComplete && !isSubmitting
                  ? "bg-[#5d5d5a] text-[#f8f6f5] hover:bg-[#4a4a47]"
                  : "bg-[rgba(93,93,90,0.15)] text-[#5d5d5a]/40 cursor-not-allowed"
                }`}
            >
              {isSubmitting ? "Menyimpan..." : "Mulai pakai planno →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}