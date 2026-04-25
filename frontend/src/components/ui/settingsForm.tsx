import React from "react";
import { ToggleGroup } from "./toggleGroup";
import { TimeRangeInput } from "./timeRangeInput";
import { SectionBlock } from "./sectionBlock";

type Preferences = {
  focusTime: string;
  workStyle: string;
  workHours: { start: string; end: string };
  focusDuration: string;
  taskType: string;
};

type SettingsFormProps = {
  preferences: Preferences;
  onChange: (field: string, value: any) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

export const SettingsForm: React.FC<SettingsFormProps> = ({
  preferences,
  onChange,
  onSubmit,
  isSubmitting,
}) => (
  <div>
    <SectionBlock
      title="Preferensi AI"
      description="Bantu AI memahami cara kerjamu"
    >
      {/* Bug fix: label options sebelumnya "Pagi/Siang/Sore/Malam",
          original menggunakan rentang jam eksplisit */}
      <ToggleGroup
        label="Paling produktif"
        options={[
          { label: "7-10 pagi", value: "7-10 pagi" },
          { label: "10-14 siang", value: "10-14 siang" },
          { label: "14-18 siang", value: "14-18 siang" },
          { label: "18-22 malam", value: "18-22 malam" },
        ]}
        value={preferences.focusTime}
        onChange={(val) => onChange("focusTime", val)}
      />

      {/* Bug fix: options sebelumnya "Sendiri/Bersama tim", original: Deep focus/Multitasking/Bergantian */}
      <ToggleGroup
        label="Gaya kerja"
        options={[
          { label: "Deep focus", value: "Deep focus" },
          { label: "Multitasking", value: "Multitasking" },
          { label: "Bergantian", value: "Bergantian" },
        ]}
        value={preferences.workStyle}
        onChange={(val) => onChange("workStyle", val)}
      />

      <TimeRangeInput
        label="Jam aktif"
        value={preferences.workHours}
        onChange={(val) => onChange("workHours", val)}
      />

      <ToggleGroup
        label="Durasi fokus"
        options={[
          { label: "30 menit", value: "30" },
          { label: "1 jam", value: "60" },
          { label: "2 jam", value: "120" },
        ]}
        value={preferences.focusDuration}
        onChange={(val) => onChange("focusDuration", val)}
      />

      <ToggleGroup
        label="Tipe pengerjaan tugas"
        options={[
          { label: "Langsung sebelum deadline", value: "last-minute" },
          { label: "Dicicil jauh hari", value: "early" },
        ]}
        value={preferences.taskType}
        onChange={(val) => onChange("taskType", val)}
      />

      {/* Bug fix: button styling sebelumnya bg-[#5d5d5a] text-white → original bg-[#d8dfe9] text-[#212121] */}
      <div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="h-[31.5px] px-[18px] bg-[#d8dfe9] rounded-[10.5px] text-[12.25px] font-semibold text-[#212121] hover:bg-[#c5cedd] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Preferensi"}
        </button>
      </div>
    </SectionBlock>
  </div>
);