import React from "react";

export const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-[10.5px] font-semibold text-[#6b6b6b] leading-3.5 mb-1.75">
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
  <div className="bg-white rounded-[14.5px] shadow-[0px_1px_4px_0px_rgba(33,33,33,0.08)] px-5.25 py-5.25 mb-6 max-w-220.5">
    <div className="flex gap-2.5 flex-wrap">
      <div className="flex flex-col flex-1 min-w-50">
        <FieldLabel>Nama</FieldLabel>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange?.(e.target.value)}
          className="h-10 px-3.5 bg-white border border-[rgba(33,33,33,0.1)] rounded-[10.5px] text-[12.25px] font-normal text-[#212121] outline-none focus:border-[rgba(93,93,90,0.5)] w-full"
          placeholder="Nama lengkap"
        />
      </div>
      <div className="flex flex-col flex-1 min-w-50">
        <FieldLabel>Email</FieldLabel>
        <input
          type="email"
          value={email}
          disabled={disabledEmail}
          className="h-10 px-3.5 bg-[#f7f6fb] border border-[rgba(33,33,33,0.1)] rounded-[10.5px] text-[12.25px] font-normal text-[#6b6b6b] outline-none w-full cursor-not-allowed"
          placeholder="Email"
        />
      </div>
    </div>
  </div>
);