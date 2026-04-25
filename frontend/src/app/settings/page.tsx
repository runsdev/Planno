"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
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
    // Simulasi API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Pengaturan berhasil disimpan!");
    }, 1000);
  };

  return (
    <div
      className="relative min-h-screen bg-[#f8f6f5] overflow-hidden"
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

      {/* ── Navbar ── */}
      {/* Fixed: Menghapus props activeView dan onViewChange karena tidak ada di definisi Navbar */}
      <Navbar />
      
      {/* ── Page body — centered ── */}
      <div className="relative z-10 flex flex-col items-center px-6 pt-4.5 pb-12">
        {/* Filter pill + heading */}
        <div className="flex items-center gap-4 mb-4.5 w-full max-w-220.5">
          <h2 className="text-[18px] font-semibold text-[#5d5d5a] capitalize tracking-[0.84px]">
            Pengaturan
          </h2>
        </div>

        <div className="w-full max-w-220.5">
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