import React from "react";

type ToggleGroupProps = {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
};

export const ToggleGroup: React.FC<ToggleGroupProps> = ({ label, options, value, onChange }) => (
  <div className="flex flex-col gap-[10.5px]">
    <p className="text-base font-semibold text-[#6b6b6b] leading-3.5">{label}</p>
    <div className="flex gap-[10.5px] flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`h-8.25 px-8.25 rounded-[10.5px] border border-[rgba(33,33,33,0.1)] text-[12.25px] font-normal text-[#212121] transition-colors cursor-pointer whitespace-nowrap
            ${value === opt.value ? "bg-[#d8dfe9]" : "bg-[#f7f6fb] hover:bg-[#edeef5]"}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);