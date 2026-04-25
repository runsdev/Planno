import React from "react";

type SectionBlockProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export const SectionBlock: React.FC<SectionBlockProps> = ({ title, description, children }) => (
    <div className="mb-6 max-w-220.5">
      <h2 className="text-[18px] font-semibold text-[#5d5d5a] capitalize tracking-[0.84px] mb-1.5">
        {title}
      </h2>
      {description && (
        <p className="text-base font-normal text-[#6b6b6b] mb-4.5">{description}</p>
      )}
      <div className="bg-white rounded-[14.5px] shadow-[0px_1px_4px_0px_rgba(33,33,33,0.08)] px-5.25 py-5.25">
        <div className="flex flex-col gap-7">{children}</div>
      </div>
    </div>
);

