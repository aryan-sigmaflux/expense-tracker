"use client";

import { useState } from "react";
import { X, Plus, ChevronDown, Check } from "lucide-react";
import {
  CURRENCY,
  addCategory,
  nextPaletteColor,
  type Category,
} from "@/lib/categories";
import { addExpense, updateExpense, type Expense } from "@/lib/expenses";

const NEW = "__new__";

export default function AddExpenseOverlay({
  categories,
  expense,
  onClose,
  onSaved,
  onCategoriesChanged,
}: {
  categories: Category[];
  expense?: Expense | null;
  onClose: () => void;
  onSaved: () => void;
  onCategoriesChanged: () => Promise<void> | void;
}) {
  const editing = !!expense;

  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [category, setCategory] = useState<string>(
    expense?.category ?? categories[0]?.name ?? NEW,
  );
  const [notes, setNotes] = useState(expense?.notes ?? "");

  // Inline "create new category" state.
  const [creating, setCreating] = useState(categories.length === 0);
  const [newName, setNewName] = useState("");
  const [creatingBusy, setCreatingBusy] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedCat = categories.find((c) => c.name === category);

  async function handleCreateCategory() {
    const name = newName.trim();
    if (!name) {
      setError("Enter a category name.");
      return;
    }
    setError(null);
    setCreatingBusy(true);
    try {
      const created = await addCategory(name, nextPaletteColor(categories.length));
      await onCategoriesChanged();
      setCategory(created.name);
      setCreating(false);
      setNewName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create category.");
    } finally {
      setCreatingBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const value = parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    if (creating || category === NEW || !category) {
      setError("Pick a category, or create one first.");
      return;
    }

    setSaving(true);
    try {
      const payload = { amount: value, category, notes: notes.trim() || undefined };
      if (editing && expense) {
        await updateExpense(expense.id, payload);
      } else {
        await addExpense(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save expense.");
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

      <div className="animate-in relative w-full max-w-[480px] rounded-t-[32px] bg-white px-6 pb-8 pt-5 shadow-[var(--shadow-floating)]">
        <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-border" />

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-dark">
            {editing ? "Edit expense" : "Add expense"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-light text-text-mid transition hover:text-text-dark"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Amount */}
          <div className="flex flex-col gap-2">
            <label htmlFor="amount" className="text-sm font-medium text-text-mid">
              Amount
            </label>
            <div className="flex items-center rounded-[16px] border border-border bg-bg-light px-4 focus-within:border-coral focus-within:bg-white">
              <span className="text-2xl font-bold text-text-muted">{CURRENCY}</span>
              <input
                id="amount"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                autoFocus={!editing}
                className="w-full bg-transparent py-3 pl-2 text-2xl font-bold text-text-dark outline-none"
              />
            </div>
          </div>

          {/* Category dropdown (custom) */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text-mid">Category</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className={`flex w-full items-center justify-between rounded-[16px] border bg-bg-light px-4 py-3 text-left transition ${
                  dropdownOpen ? "border-coral bg-white" : "border-border"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {creating ? (
                    <span className="text-base font-medium text-text-muted">
                      New category…
                    </span>
                  ) : selectedCat ? (
                    <>
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: selectedCat.color }}
                      />
                      <span className="text-base font-medium text-text-dark">
                        {selectedCat.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-base font-medium text-text-muted">
                      Select a category
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-text-muted transition ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <button
                  type="button"
                  aria-hidden
                  tabIndex={-1}
                  onClick={() => setDropdownOpen(false)}
                  className="fixed inset-0 z-10 cursor-default"
                />
              )}
              {dropdownOpen && (
                <div className="absolute z-20 mt-2 max-h-[230px] w-full overflow-y-auto rounded-[18px] border border-border bg-white p-1.5 shadow-[var(--shadow-floating)]">
                  <button
                    type="button"
                    onClick={() => {
                      setCreating(true);
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-left text-sm font-semibold text-coral transition hover:bg-coral/5"
                  >
                    <Plus size={16} /> Create new category
                  </button>
                  {categories.length > 0 && (
                    <div className="my-1 h-px bg-border" />
                  )}
                  {categories.map((c) => {
                    const sel = !creating && c.name === category;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCategory(c.name);
                          setCreating(false);
                          setDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-[12px] px-3 py-2.5 text-left transition hover:bg-bg-light ${
                          sel ? "bg-bg-light" : ""
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: c.color }}
                          />
                          <span className="text-sm font-medium text-text-dark">
                            {c.name}
                          </span>
                        </span>
                        {sel && <Check size={16} className="text-coral" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {creating && (
              <div className="flex gap-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="New category name"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateCategory();
                    }
                  }}
                  className="min-w-0 flex-1 rounded-[14px] border border-border bg-bg-light px-4 py-2.5 text-base text-text-dark outline-none transition focus:border-coral focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={creatingBusy}
                  aria-label="Create category"
                  className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] bg-coral text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {creatingBusy ? <Plus size={20} className="animate-pulse" /> : <Check size={20} />}
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <label htmlFor="notes" className="text-sm font-medium text-text-mid">
              Notes <span className="text-text-muted">(optional)</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What was this for?"
              rows={2}
              className="resize-none rounded-[16px] border border-border bg-bg-light px-4 py-3 text-base text-text-dark outline-none transition focus:border-coral focus:bg-white"
            />
          </div>

          {error && (
            <p className="rounded-[12px] bg-coral/10 px-3 py-2 text-sm font-medium text-coral">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-coral py-3.5 text-base font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving…" : editing ? "Save changes" : "Add expense"}
          </button>
        </form>
      </div>
    </div>
  );
}
