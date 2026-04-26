"use client";

interface TaskPreviewFieldProps {
  label: string;
  children: React.ReactNode;
}

export function TaskPreviewField({ label, children }: TaskPreviewFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10.5px] font-semibold text-[#6b6b6b] uppercase tracking-wide">
        {label}
      </span>
      {children}
    </div>
  );
}

// ─── Reusable text input inside preview ───────────────────────────────────────
interface PreviewTextInputProps {
  value: string;
  onChange: (v: string) => void;
}

export function PreviewTextInput({ value, onChange }: PreviewTextInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-9.5 px-3 bg-white border border-[rgba(33,33,33,0.1)] rounded-[10.5px] text-[13px] font-normal text-[#212121] outline-none focus:border-[rgba(93,93,90,0.4)] transition-colors"
    />
  );
}