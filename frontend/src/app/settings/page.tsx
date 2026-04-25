"use client";

import React, { useState } from "react";
import { Kanban, User } from "lucide-react";
import { ProfileCard } from "@/components/profile/profileCard";
import { SettingsForm } from "@/components/ui/settingsForm";

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

const defaultProfile = { name: "Vania Aprilia", email: "vania@gmail.com" };
const defaultPreferences = {
  focusTime: "7-10 pagi",
  workStyle: "Bergantian",
  workHours: { start: "", end: "" },
  focusDuration: "",
  taskType: "",
};

export default function SettingsPage() {
  const [profile, setProfile] = useState(defaultProfile);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1000);
  };

  return (
    <div
      className="relative min-h-screen bg-[#f8f6f5] overflow-hidden"
      style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}
    >
      {/* ── Decorative flowers ── */}
      <div className="absolute -top-15 -right-15 pointer-events-none z-0">
        <Flower size={400} fill="#fce4e4" rotate={30} />
      </div>
      <div className="absolute top-7.5 right-80 pointer-events-none z-10">
        <Flower size={100} fill="#d1ecf1" rotate={65} />
      </div>
      <div className="absolute -bottom-15 -left-15 pointer-events-none z-0">
        <Flower size={400} fill="#fce4e4" rotate={30} />
      </div>
      <div className="absolute bottom-7.5 left-80 pointer-events-none z-10">
        <Flower size={100} fill="#d1ecf1" rotate={65} />
      </div>

      {/* ── Navbar ── */}
      <header className="h-[50px] bg-[#f8f6f5] border-b border-[rgba(93,93,90,0.7)] flex items-center px-6 shrink-0 gap-4 relative z-20">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative flex items-center justify-center w-[26px] h-[26px]">
            <div className="absolute inset-0 rounded-[15px] bg-[#5d5d5a]/10" />
            <Kanban className="w-4 h-4 text-[#5d5d5a] relative z-10" />
          </div>
          <span className="text-[18px] font-bold italic text-[#5d5d5a]">
            planno
          </span>
        </div>
        <div className="flex-1" />
        <button className="flex items-center justify-center cursor-pointer">
          <User className="w-[26px] h-[26px] text-[#5d5d5a]" />
        </button>
      </header>

      {/* ── Page body — centered ── */}
      <div className="relative z-10 flex flex-col items-center px-6 pt-[18px] pb-12">
        {/* Filter pill + heading */}
        <div className="flex items-center gap-4 mb-[18px] w-full max-w-[882px]">
          <h2 className="text-[18px] font-semibold text-[#5d5d5a] capitalize tracking-[0.84px]">
            Pengaturan
          </h2>
        </div>

        <div className="w-full max-w-[882px]">
          <ProfileCard
            name={profile.name}
            email={profile.email}
            onNameChange={(name) => setProfile((prev) => ({ ...prev, name }))}
            disabledEmail={true}
          />
          <SettingsForm
            preferences={preferences}
            onChange={handleChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}