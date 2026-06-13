"use client";

import { X, CalendarClock, Palette, LogOut } from "lucide-react";

export default function SettingsOverlay({
  username,
  onGoCurrentMonth,
  onEditCategories,
  onLogout,
  onClose,
}: {
  username: string;
  onGoCurrentMonth: () => void;
  onEditCategories: () => void;
  onLogout: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div className="animate-in relative w-full max-w-[480px] rounded-t-[32px] bg-white px-6 pb-8 pt-5 shadow-[var(--shadow-floating)]">
        <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-border" />

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-dark">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-light text-text-mid transition hover:text-text-dark"
          >
            <X size={18} />
          </button>
        </div>

        {/* Account */}
        <div className="mb-5 flex items-center gap-3 rounded-[20px] bg-bg-light p-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-coral text-lg font-bold uppercase text-white">
            {username.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-text-dark">
              {username}
            </p>
            <p className="text-xs font-medium text-text-muted">Signed in</p>
          </div>
        </div>

        {/* Options */}
        <ul className="flex flex-col gap-2">
          <li>
            <button
              type="button"
              onClick={() => {
                onGoCurrentMonth();
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-[16px] border border-border bg-white px-4 py-3 text-left transition hover:bg-bg-light"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-light text-text-dark">
                <CalendarClock size={18} />
              </span>
              <span className="text-sm font-semibold text-text-dark">
                Go to current month
              </span>
            </button>
          </li>

          <li>
            <button
              type="button"
              onClick={() => {
                onEditCategories();
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-[16px] border border-border bg-white px-4 py-3 text-left transition hover:bg-bg-light"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-light text-text-dark">
                <Palette size={18} />
              </span>
              <span className="text-sm font-semibold text-text-dark">
                Edit categories
              </span>
            </button>
          </li>

          {/* Last option: Log out */}
          <li>
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-[16px] border border-coral/20 bg-coral/5 px-4 py-3 text-left transition hover:bg-coral/10"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral/15 text-coral">
                <LogOut size={18} />
              </span>
              <span className="text-sm font-semibold text-coral">Log out</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
