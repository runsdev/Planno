"use client";

import { Kanban, Calendar, PenLine, Timer, Settings, CircleUserRound, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { SearchBar } from "@/components/ui/searchBar";
import { AddTaskModal, ParsedResult } from "@/components/add-task/addTaskModal";
import { FocusModal } from "@/components/focus/focusModal";

function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center justify-center w-8 h-8 rounded-[10.5px] transition-colors cursor-pointer
          ${open ? "bg-[#5d5d5a]/10 text-[#5d5d5a]" : "text-[#5d5d5a]/70 hover:bg-[#5d5d5a]/10 hover:text-[#5d5d5a]"}`}
      >
        <CircleUserRound className="w-4.5 h-4.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-44 bg-white rounded-[12px] shadow-[0px_4px_16px_0px_rgba(33,33,33,0.12)] border border-[rgba(93,93,90,0.1)] overflow-hidden z-50">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-[12.25px] font-medium text-[#d9534f] hover:bg-[#fff0f0] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            Keluar dari planno
          </button>
        </div>
      )}
    </div>
  );
}

type NavbarProps = {
  activeView?: "Kanban" | "Calendar";
  onViewChange?: (view: "Kanban" | "Calendar") => void;
  onMarkComplete?: (taskId: number, totalSeconds: number) => void;
  taskProgress?: Record<number, { completedSessions: number; totalFocusSeconds: number }>;
  onSessionFinished?: (taskId: number, addedSeconds: number) => void;
  completedTaskIds?: number[]; 
};

export function Navbar({ activeView, onViewChange, onMarkComplete, taskProgress = {}, onSessionFinished, completedTaskIds = [],}: NavbarProps) {
  const pathname   = usePathname();
  const router     = useRouter();
  const isSettings = pathname === "/settings";
  const isPlanner  = pathname === "/planner";
  const isTabMode  = isPlanner && !!onViewChange;

  const [addModalOpen,   setAddModalOpen]   = useState(false);
  const [focusModalOpen, setFocusModalOpen] = useState(false);

  const navItems: { label: "Kanban" | "Calendar"; icon: typeof Kanban }[] = [
    { label: "Kanban",   icon: Kanban   },
    { label: "Calendar", icon: Calendar },
  ];

  const handleNavClick = (label: "Kanban" | "Calendar") => {
    if (isTabMode) onViewChange?.(label);
    else router.push(`/planner?view=${label}`);
  };

  // TODO: wire to actual task store
  const handleSaveTask = (result: ParsedResult) => {
    console.log("Task saved:", result);
  };

  // TODO: wire totalSeconds to task store to update time spent
  const handleSessionComplete = (taskId: number | null, totalSeconds: number) => {
    console.log("Session complete — taskId:", taskId, "totalSeconds:", totalSeconds);
  };

  return (
    <>
      <header
        className="h-12.5 bg-[#f8f6f5] border-b border-[rgba(93,93,90,0.2)] flex items-center px-6 shrink-0 gap-4 relative z-20"
        style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}
      >
        {/* ── Logo ── */}
        <Link href="/planner" className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center justify-center w-6 h-6 border border-[#5d5d5a]/20 rounded-md bg-white shadow-sm">
            <Kanban className="w-3.5 h-3.5 text-[#5d5d5a]" />
          </div>
          <span className="text-[17px] font-bold italic text-[#4a4a47] tracking-tight">planno</span>
        </Link>

        {/* ── Nav / Tab links ── */}
        <div className="flex-1 flex items-center justify-center gap-6">
          {navItems.map(({ label, icon: Icon }) => {
            const isActive = isTabMode ? activeView === label : false;
            return (
              <button
                key={label}
                type="button"
                onClick={() => handleNavClick(label)}
                className={`flex items-center gap-2 h-8 px-2 text-[14px] font-medium transition-all cursor-pointer
                  ${isActive ? "text-[#5d5d5a]" : "text-[#5d5d5a]/40 hover:text-[#5d5d5a]"}`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? "opacity-100" : "opacity-60"}`} />
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-2 shrink-0">
          {!isSettings && (
            <>
              <SearchBar />

              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="flex items-center gap-1.5 h-8.5 px-4 rounded-[8px] bg-[#4a4a47] text-[#f8f6f5] text-[13px] font-medium hover:bg-[#333331] transition-all cursor-pointer"
              >
                <PenLine className="w-3.5 h-3.5" />
                Tambah
              </button>

              <div className="flex items-center gap-1.5">
                {/* Timer → buka focus modal */}
                <button
                  type="button"
                  onClick={() => setFocusModalOpen(true)}
                  className={`flex items-center justify-center w-8.5 h-8.5 rounded-[8px] transition-all cursor-pointer
                    ${focusModalOpen
                      ? "bg-[#4a4a47] text-[#f8f6f5]"
                      : "bg-[#f8f6f5] text-[#5d5d5a]/70 hover:bg-[#eeede9] hover:text-[#5d5d5a]"
                    }`}
                >
                  <Timer className="w-4.5 h-4.5" />
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/settings")}
                  className="flex items-center justify-center w-8.5 h-8.5 bg-[#f8f6f5] rounded-[8px] text-[#5d5d5a]/70 hover:bg-[#eeede9] hover:text-[#5d5d5a] transition-all cursor-pointer"
                >
                  <Settings className="w-4.5 h-4.5" />
                </button>
              </div>
            </>
          )}

          <div className="pl-1 border-l border-[#5d5d5a]/10 ml-1">
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Modals rendered outside header */}
      <AddTaskModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleSaveTask}
      />
      <FocusModal
        open={focusModalOpen}
        onClose={() => setFocusModalOpen(false)}
        onMarkComplete={(taskId, totalSeconds) => onMarkComplete?.(taskId, totalSeconds)}
        taskProgress={taskProgress}
        onSessionFinished={(taskId, addedSeconds) => onSessionFinished?.(taskId, addedSeconds)}
        completedTaskIds={completedTaskIds} 
      />
    </>
  );
}