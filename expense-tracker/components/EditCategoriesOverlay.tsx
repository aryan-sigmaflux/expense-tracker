"use client";

import { useState } from "react";
import { X, Pencil, Check } from "lucide-react";
import { updateCategory, type Category } from "@/lib/categories";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export default function EditCategoriesOverlay({
  categories,
  onClose,
  onChanged,
}: {
  categories: Category[];
  onClose: () => void;
  onChanged: () => Promise<void> | void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#000000");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(c: Category) {
    setEditingId(c.id);
    setName(c.name);
    setColor(HEX_RE.test(c.color) ? c.color : "#5A5A6E");
    setError(null);
  }

  function cancel() {
    setEditingId(null);
    setError(null);
  }

  async function save(id: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name can't be empty.");
      return;
    }
    if (!HEX_RE.test(color)) {
      setError("Color must be a hex code like #2A7D6E.");
      return;
    }
    setSaving(true);
    try {
      await updateCategory(id, trimmed, color);
      await onChanged();
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save category.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div className="animate-in relative max-h-[85vh] w-full max-w-[480px] overflow-y-auto rounded-t-[32px] bg-white px-6 pb-8 pt-5 shadow-[var(--shadow-floating)]">
        <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-border" />

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-dark">Edit categories</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-light text-text-mid transition hover:text-text-dark"
          >
            <X size={18} />
          </button>
        </div>

        {categories.length === 0 ? (
          <p className="rounded-[16px] bg-bg-light p-6 text-center text-sm text-text-muted">
            No categories yet. Add an expense to create one.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {categories.map((c) => {
              const isEditing = editingId === c.id;
              return (
                <li
                  key={c.id}
                  className="rounded-[18px] border border-border p-3"
                >
                  {isEditing ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <label className="relative h-11 w-11 shrink-0 cursor-pointer overflow-hidden rounded-[14px] border border-border">
                          <span
                            className="block h-full w-full"
                            style={{ backgroundColor: color }}
                          />
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="absolute inset-0 cursor-pointer opacity-0"
                            aria-label="Pick color"
                          />
                        </label>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Category name"
                          className="min-w-0 flex-1 rounded-[14px] border border-border bg-bg-light px-4 py-2.5 text-base text-text-dark outline-none transition focus:border-coral focus:bg-white"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-muted">
                          Hex
                        </span>
                        <input
                          value={color}
                          onChange={(e) => {
                            let v = e.target.value.trim();
                            if (v && !v.startsWith("#")) v = `#${v}`;
                            setColor(v);
                          }}
                          placeholder="#2A7D6E"
                          maxLength={7}
                          className={`w-32 rounded-[12px] border bg-bg-light px-3 py-2 font-mono text-sm uppercase text-text-dark outline-none transition focus:bg-white ${
                            HEX_RE.test(color)
                              ? "border-border focus:border-coral"
                              : "border-coral"
                          }`}
                        />
                      </div>

                      {error && (
                        <p className="text-sm font-medium text-coral">{error}</p>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={cancel}
                          className="flex-1 rounded-full border border-border bg-white py-2.5 text-sm font-semibold text-text-mid transition hover:bg-bg-light"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => save(c.id)}
                          disabled={saving}
                          className="flex-1 rounded-full bg-coral py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                        >
                          {saving ? "Saving…" : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span
                        className="h-10 w-10 shrink-0 rounded-[14px]"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="min-w-0 flex-1 truncate text-base font-semibold text-text-dark">
                        {c.name}
                      </span>
                      <span className="font-mono text-xs uppercase text-text-muted">
                        {c.color}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        aria-label={`Edit ${c.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition hover:bg-bg-light hover:text-text-dark"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-text-dark py-3.5 text-base font-semibold text-white transition hover:opacity-90"
        >
          <Check size={18} /> Done
        </button>
      </div>
    </div>
  );
}
