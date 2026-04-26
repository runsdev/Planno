"use client";

import { Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function SearchBar() {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  const handleCollapse = () => {
    setExpanded(false);
    setQuery("");
  };

  if (expanded) {
    return (
      <div className="flex items-center h-8 px-3 gap-2 rounded-[10.5px] bg-[#5d5d5a]/10 w-55 transition-all">
        <Search className="w-3.5 h-3.5 text-[#5d5d5a]/60 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari tugas..."
          className="flex-1 bg-transparent text-[12.25px] text-[#212121] placeholder:text-[#5d5d5a]/40 outline-none"
        />
        <button
          onClick={handleCollapse}
          className="cursor-pointer text-[#5d5d5a]/50 hover:text-[#5d5d5a] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setExpanded(true)}
      className="flex items-center justify-center w-8 h-8 rounded-[10.5px] text-[#5d5d5a]/70 hover:bg-[#5d5d5a]/10 hover:text-[#5d5d5a] transition-colors cursor-pointer"
    >
      <Search className="w-4.5 h-4.5" />
    </button>
  );
}