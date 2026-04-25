import React from "react";

export const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-[10.5px] font-semibold text-[#6b6b6b] leading-[14px] mb-[7px]">
    {children}
  </label>
);

type ProfileCardProps = {
  name: string;
  email: string;
  onNameChange?: (value: string) => void;
  disabledEmail?: boolean;
};

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  email,
  onNameChange,
  disabledEmail = true,
}) => (
  // Bug fix: sebelumnya ada wrapper div dengan title "Profil" di dalam card,
  // original tidak punya — title ada di luar card (di heading row page)
  <div className="bg-white rounded-[14.5px] shadow-[0px_1px_4px_0px_rgba(33,33,33,0.08)] px-[21px] py-[21px] mb-6 max-w-[882px]">
    <div className="flex gap-[10px] flex-wrap">
      <div className="flex flex-col flex-1 min-w-[200px]">
        <FieldLabel>Nama</FieldLabel>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange?.(e.target.value)}
          className="h-[40px] px-[14px] bg-white border border-[rgba(33,33,33,0.1)] rounded-[10.5px] text-[12.25px] font-normal text-[#212121] outline-none focus:border-[rgba(93,93,90,0.5)] w-full"
          placeholder="Nama lengkap"
        />
      </div>
      <div className="flex flex-col flex-1 min-w-[200px]">
        <FieldLabel>Email</FieldLabel>
        <input
          type="email"
          value={email}
          disabled={disabledEmail}
          className="h-[40px] px-[14px] bg-[#f7f6fb] border border-[rgba(33,33,33,0.1)] rounded-[10.5px] text-[12.25px] font-normal text-[#6b6b6b] outline-none w-full cursor-not-allowed"
          placeholder="Email"
        />
      </div>
    </div>
  </div>
);