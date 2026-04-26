"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Check } from "lucide-react";
import { FocusTask } from "./focusModal";

const PRIORITY_BADGE: Record<FocusTask["priority"], { bg: string; text: string }> = {
  Tinggi: { bg: "bg-[#fdecea]",               text: "text-[#e07b72]" },
  Sedang: { bg: "bg-[#fdf0e0]",               text: "text-[#d4974a]" },
  Rendah: { bg: "bg-[rgba(222,241,208,0.6)]", text: "text-[#6bab7e]" },
};

interface FocusTaskSearchProps {
  tasks: FocusTask[];
  selected: FocusTask | null;
  onSelect: (task: FocusTask | null) => void;
  completedTaskIds: number[]; // ← tambah
}

export function FocusTaskSearch({
  tasks,
  selected,
  onSelect,
  completedTaskIds,
}: FocusTaskSearchProps) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const ref               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filter: hapus task yang sudah completed
  const availableTasks = tasks.filter((t) => !completedTaskIds.includes(t.id));

  const filtered = availableTasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (task: FocusTask) => {
    onSelect(task);
    setOpen(false);
    setQuery("");
  };

  const handleClear = () => {
    onSelect(null);
    setQuery("");
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10.5px] font-semibold text-[#6b6b6b]">Mengerjakan</span>

      <div className="relative" ref={ref}>
        <div
          onClick={() => setOpen((p) => !p)}
          className={`flex items-center gap-2 h-9.5 px-3 rounded-[10.5px] border cursor-pointer transition-colors
            ${open
              ? "border-[rgba(93,93,90,0.4)] bg-white"
              : "border-[rgba(33,33,33,0.1)] bg-white hover:border-[rgba(93,93,90,0.3)]"
            }`}
        >
          <Search className="w-3.5 h-3.5 text-[#5d5d5a]/40 shrink-0" />
          {selected && !open ? (
            <div className="flex-1 flex items-center justify-between gap-2 overflow-hidden">
              <span className="text-[12.25px] font-medium text-[#212121] truncate">
                {selected.title}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[10px] font-semibold px-2 py-px rounded-full ${PRIORITY_BADGE[selected.priority].bg} ${PRIORITY_BADGE[selected.priority].text}`}>
                  {selected.priority}
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleClear(); }}
                  className="text-[#5d5d5a]/40 hover:text-[#5d5d5a] text-[14px] leading-none cursor-pointer"
                >
                  ×
                </button>
              </div>
            </div>
          ) : (
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => { e.stopPropagation(); setOpen(true); }}
              placeholder="Cari tugas aktif..."
              className="flex-1 bg-transparent text-[12.25px] text-[#212121] placeholder:text-[#5d5d5a]/40 outline-none"
            />
          )}
        </div>

        {open && (
          <div className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white rounded-[12px] shadow-[0px_4px_16px_0px_rgba(33,33,33,0.12)] border border-[rgba(93,93,90,0.1)] overflow-hidden z-50 max-h-50 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-[12px] text-[#5d5d5a]/50 text-center">
                {availableTasks.length === 0
                  ? "Semua tugas sudah selesai 🎉"
                  : "Tugas tidak ditemukan"}
              </div>
            ) : (
              filtered.map((task) => {
                const pb         = PRIORITY_BADGE[task.priority];
                const isSelected = selected?.id === task.id;
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => handleSelect(task)}
                    className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left transition-colors cursor-pointer
                      ${isSelected ? "bg-[#f8f6f5]" : "hover:bg-[#f8f6f5]"}`}
                  >
                    <span className="text-[12.25px] font-medium text-[#212121] flex-1 truncate">
                      {task.title}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-px rounded-full ${pb.bg} ${pb.text}`}>
                        {task.priority}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#6bab7e]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}