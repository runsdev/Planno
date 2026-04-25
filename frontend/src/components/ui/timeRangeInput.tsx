import React from "react";

type TimeRangeInputProps = {
  label: string;
  value: { start: string; end: string };
  onChange: (val: { start: string; end: string }) => void;
};

export const TimeRangeInput: React.FC<TimeRangeInputProps> = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-[10.5px]">
    {/* Bug fix: styling label tidak match original */}
    <p className="text-base font-semibold text-[#6b6b6b] leading-[14px]">{label}</p>
    <div className="flex items-center gap-[10.5px]">
      <input
        type="time"
        value={value.start}
        onChange={(e) => onChange({ ...value, start: e.target.value })}
        // Bug fix: h-[40px] → h-[41.5px], w-[110px] → flex-1 (matching original)
        className="flex-1 h-[41.5px] px-[14px] bg-white border border-[rgba(33,33,33,0.1)] rounded-[10.5px] text-[12.25px] font-normal text-[#212121] outline-none focus:border-[rgba(93,93,90,0.5)]"
      />
      {/* Bug fix: "sampai" → "s/d" sesuai original */}
      <span className="text-sm font-normal text-[#6b6b6b] whitespace-nowrap">s/d</span>
      <input
        type="time"
        value={value.end}
        onChange={(e) => onChange({ ...value, end: e.target.value })}
        className="flex-1 h-[41.5px] px-[14px] bg-white border border-[rgba(33,33,33,0.1)] rounded-[10.5px] text-[12.25px] font-normal text-[#212121] outline-none focus:border-[rgba(93,93,90,0.5)]"
      />
    </div>
  </div>
);