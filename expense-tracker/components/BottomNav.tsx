"use client";

import { Home, Settings, Plus } from "lucide-react";

export default function BottomNav({
  onAdd,
  onSettings,
}: {
  onAdd: () => void;
  onSettings: () => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-5 pb-5">
      <div className="relative flex w-full max-w-[340px] items-center justify-between rounded-full bg-text-dark px-12 py-4 shadow-[var(--shadow-floating)]">
        <button
          type="button"
          className="flex items-center justify-center text-white transition active:scale-90"
          aria-label="Home"
        >
          <Home size={22} />
        </button>

        {/* Center floating add button */}
        <button
          type="button"
          onClick={onAdd}
          aria-label="Add expense"
          className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-coral text-white shadow-[var(--shadow-floating)] ring-4 ring-bg-light transition active:scale-95"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>

        <button
          type="button"
          onClick={onSettings}
          className="flex items-center justify-center text-white/55 transition hover:text-white active:scale-90"
          aria-label="Settings"
        >
          <Settings size={22} />
        </button>
      </div>
    </nav>
  );
}
