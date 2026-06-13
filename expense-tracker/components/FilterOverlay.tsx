"use client";

import { X, ChevronDown, ArrowUp, ArrowDown } from "lucide-react";
import type { Category } from "@/lib/categories";

export type SortField = "recent" | "amount";
export type SortDir = "up" | "down";

export function sortDirLabel(field: SortField, dir: SortDir): string {
  if (field === "amount") return dir === "up" ? "Highest first" : "Lowest first";
  return dir === "up" ? "Oldest first" : "Newest first";
}

export default function FilterOverlay({
  tab,
  sortField,
  sortDir,
  onSortFieldChange,
  onToggleDir,
  categories,
  excluded,
  onToggleCategory,
  onAllCategories,
  onNoneCategories,
  onClose,
}: {
  tab: "expenses" | "categories";
  sortField: SortField;
  sortDir: SortDir;
  onSortFieldChange: (f: SortField) => void;
  onToggleDir: () => void;
  categories: Category[];
  excluded: Set<string>;
  onToggleCategory: (name: string) => void;
  onAllCategories: () => void;
  onNoneCategories: () => void;
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
          <h2 className="text-lg font-bold text-text-dark">Sort &amp; filter</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-light text-text-mid transition hover:text-text-dark"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sort */}
        <div className="mb-6 flex flex-col gap-2">
          <span className="text-sm font-medium text-text-mid">Sort by</span>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                value={sortField}
                onChange={(e) => onSortFieldChange(e.target.value as SortField)}
                className="w-full appearance-none rounded-[16px] border border-border bg-bg-light px-4 py-3 pr-10 text-base font-medium text-text-dark outline-none transition focus:border-coral focus:bg-white"
              >
                <option value="recent">Recent</option>
                <option value="amount">Amount</option>
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
            </div>
            <button
              type="button"
              onClick={onToggleDir}
              className="flex items-center gap-1.5 rounded-[16px] border border-border bg-bg-light px-4 py-3 text-sm font-semibold text-text-dark transition hover:border-coral"
            >
              {sortDir === "up" ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
              {sortDirLabel(sortField, sortDir)}
            </button>
          </div>
        </div>

        {/* Category filter (expenses tab only) */}
        {tab === "expenses" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-mid">
                Show categories
              </span>
              <div className="flex gap-3 text-xs font-semibold">
                <button
                  type="button"
                  onClick={onAllCategories}
                  className="text-coral"
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={onNoneCategories}
                  className="text-text-muted"
                >
                  None
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.length === 0 && (
                <p className="text-sm text-text-muted">No categories yet.</p>
              )}
              {categories.map((c) => {
                const on = !excluded.has(c.name);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onToggleCategory(c.name)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                      on
                        ? "border-transparent text-white"
                        : "border-border bg-bg-light text-text-muted"
                    }`}
                    style={on ? { backgroundColor: c.color } : undefined}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: on ? "rgba(255,255,255,0.85)" : c.color,
                      }}
                    />
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-7 w-full rounded-full bg-coral py-3.5 text-base font-semibold text-white transition hover:opacity-90"
        >
          Done
        </button>
      </div>
    </div>
  );
}
