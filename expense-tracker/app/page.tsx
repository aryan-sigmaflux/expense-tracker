"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  Pencil,
  Trash2,
  SlidersHorizontal,
  Eye,
  EyeOff,
} from "lucide-react";
import { getSession, logout, type Session } from "@/lib/auth";
import {
  monthKey,
  currentMonthKey,
  monthLabel,
  getSelectedMonth,
  setSelectedMonth as persistSelectedMonth,
} from "@/lib/dates";
import {
  listExpenses,
  deleteExpense,
  type Expense,
} from "@/lib/expenses";
import {
  listCategories,
  colorFor,
  iconFor,
  iconComp,
  formatMoney,
  type Category,
} from "@/lib/categories";
import CategoryPie, { type PieDatum } from "@/components/CategoryPie";
import BottomNav from "@/components/BottomNav";
import AddExpenseOverlay from "@/components/AddExpenseOverlay";
import FilterOverlay, {
  type SortField,
  type SortDir,
} from "@/components/FilterOverlay";
import SettingsOverlay from "@/components/SettingsOverlay";
import EditCategoriesOverlay from "@/components/EditCategoriesOverlay";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());

  // Tabs + sort/filter state
  const [tab, setTab] = useState<"expenses" | "categories">("expenses");
  const [filterOpen, setFilterOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editCatsOpen, setEditCatsOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>("recent");
  const [sortDir, setSortDir] = useState<SortDir>("down");
  const [excludedCats, setExcludedCats] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showTotal, setShowTotal] = useState(true);

  const refreshExpenses = useCallback(async () => {
    try {
      setExpenses(await listExpenses());
    } catch {
      // keep previous list on transient errors
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      setCategories(await listCategories());
    } catch {
      // keep previous list on transient errors
    }
  }, []);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    setSession(s);
    setSelectedMonth(getSelectedMonth());
    setShowTotal(localStorage.getItem("expense_tracker_show_total") !== "0");
    Promise.all([refreshExpenses(), refreshCategories()]).finally(() =>
      setLoading(false),
    );
  }, [router, refreshExpenses, refreshCategories]);

  const monthExpenses = useMemo(
    () => expenses.filter((e) => monthKey(e.created_at) === selectedMonth),
    [expenses, selectedMonth],
  );

  const total = useMemo(
    () => monthExpenses.reduce((sum, e) => sum + e.amount, 0),
    [monthExpenses],
  );

  const pieData = useMemo<PieDatum[]>(() => {
    const byCat = new Map<string, number>();
    for (const e of monthExpenses) {
      byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.amount);
    }
    return [...byCat.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value, color: colorFor(name, categories) }));
  }, [monthExpenses, categories]);

  // Selecting a slice reveals the individual expenses behind that category.
  const breakdownItems = useMemo(
    () =>
      activeCategory
        ? monthExpenses
            .filter((e) => e.category === activeCategory)
            .sort((a, b) => b.amount - a.amount)
        : [],
    [activeCategory, monthExpenses],
  );

  function toggleSlice(name: string) {
    setActiveCategory((prev) => (prev === name ? null : name));
  }

  // Different month -> a previously selected slice may no longer exist.
  useEffect(() => {
    setActiveCategory(null);
  }, [selectedMonth]);

  // Expenses: filter by selected categories, then sort.
  const visibleExpenses = useMemo(() => {
    const list = monthExpenses.filter((e) => !excludedCats.has(e.category));
    return [...list].sort((a, b) => {
      if (sortField === "amount") {
        return sortDir === "up" ? b.amount - a.amount : a.amount - b.amount;
      }
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return sortDir === "up" ? ta - tb : tb - ta;
    });
  }, [monthExpenses, excludedCats, sortField, sortDir]);

  // Per-category stats for the selected month (used by the Categories tab).
  const categoryStats = useMemo(() => {
    return categories.map((c) => {
      const items = monthExpenses.filter((e) => e.category === c.name);
      const totalSpent = items.reduce((s, e) => s + e.amount, 0);
      const last = items.reduce(
        (m, e) => Math.max(m, new Date(e.created_at).getTime()),
        0,
      );
      return { ...c, total: totalSpent, count: items.length, last };
    });
  }, [categories, monthExpenses]);

  const visibleCategories = useMemo(() => {
    return [...categoryStats].sort((a, b) => {
      if (sortField === "amount") {
        return sortDir === "up" ? b.total - a.total : a.total - b.total;
      }
      return sortDir === "up" ? a.last - b.last : b.last - a.last;
    });
  }, [categoryStats, sortField, sortDir]);

  function toggleCategoryFilter(name: string) {
    setExcludedCats((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function openAdd() {
    setEditing(null);
    setOverlayOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditing(expense);
    setOverlayOpen(true);
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  function toggleShowTotal() {
    setShowTotal((v) => {
      const next = !v;
      localStorage.setItem("expense_tracker_show_total", next ? "1" : "0");
      return next;
    });
  }

  function goToCurrentMonth() {
    const cur = currentMonthKey();
    persistSelectedMonth(cur);
    setSelectedMonth(cur);
  }

  async function handleDelete(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteExpense(id);
    } catch {
      refreshExpenses();
    }
  }

  if (loading || !session) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-text-muted">Loading…</p>
      </main>
    );
  }

  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <main className="mx-auto w-full max-w-[480px] flex-1 px-5 pb-28 pt-6">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-text-muted">{todayLabel}</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-text-dark">
              Hi, {session.username}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/calendar"
              aria-label="Open calendar"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-text-dark shadow-[var(--shadow-card)] transition hover:bg-bg-light"
            >
              <CalendarDays size={21} />
            </Link>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Account and settings"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-text-dark text-base font-bold uppercase text-white shadow-[var(--shadow-card)]"
            >
              {session.username.charAt(0)}
            </button>
          </div>
        </header>

        {/* Hero total */}
        <section className="animate-in relative mb-5 overflow-hidden rounded-[32px] bg-coral p-6 text-white shadow-[var(--shadow-floating)]">
          <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-14 -left-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                Total spent
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                <CalendarDays size={13} />
                {monthLabel(selectedMonth)}
              </span>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <p className="text-5xl font-extrabold tracking-tight">
                {showTotal ? formatMoney(total) : "••••••"}
              </p>
              <button
                type="button"
                onClick={toggleShowTotal}
                aria-label={showTotal ? "Hide total" : "Show total"}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
              >
                {showTotal ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            <p className="mt-1.5 text-sm font-medium text-white/80">
              {monthExpenses.length}{" "}
              {monthExpenses.length === 1 ? "expense" : "expenses"} this month
            </p>
          </div>
        </section>

        {/* Pie breakdown card */}
        {monthExpenses.length > 0 && (
          <section className="animate-in mb-5 rounded-[32px] bg-white p-6 shadow-[var(--shadow-card)]">
            <>
              <CategoryPie
                data={pieData}
                activeName={activeCategory}
                onSelect={toggleSlice}
              />
              {/* Legend (also clickable) */}
              <div className="mt-5 flex flex-wrap justify-center gap-x-2 gap-y-2">
                {pieData.map((d) => {
                  const active = activeCategory === d.name;
                  const dimmed = activeCategory !== null && !active;
                  return (
                    <button
                      key={d.name}
                      type="button"
                      onClick={() => toggleSlice(d.name)}
                      className={`flex items-center gap-1.5 rounded-full px-2 py-1 transition ${
                        active ? "bg-bg-light" : ""
                      } ${dimmed ? "opacity-40" : ""}`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="text-xs font-medium text-text-mid">
                        {d.name}
                      </span>
                      <span className="text-xs font-semibold text-text-dark">
                        {formatMoney(d.value)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Breakdown of the selected category */}
              {activeCategory && (
                <div className="animate-in mt-5 border-t border-border pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: colorFor(activeCategory, categories),
                        }}
                      />
                      <h3 className="text-sm font-bold text-text-dark">
                        {activeCategory}
                      </h3>
                      <span className="text-xs font-medium text-text-muted">
                        {breakdownItems.length}{" "}
                        {breakdownItems.length === 1 ? "item" : "items"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveCategory(null)}
                      className="text-xs font-semibold text-coral"
                    >
                      Clear
                    </button>
                  </div>

                  <ul className="flex flex-col gap-2">
                    {breakdownItems.map((e) => (
                      <li
                        key={e.id}
                        className="flex items-start gap-3 rounded-[16px] bg-bg-light p-3"
                      >
                        <div className="min-w-0 flex-1">
                          {e.notes ? (
                            <p className="text-sm font-semibold text-text-dark">
                              {e.notes}
                            </p>
                          ) : (
                            <p className="text-sm font-medium italic text-text-muted">
                              No note added
                            </p>
                          )}
                          <p className="mt-0.5 text-xs text-text-muted">
                            {formatDate(e.created_at)}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-bold text-text-dark">
                          {formatMoney(e.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          </section>
        )}

        {/* Tabs + filter */}
        <section className="animate-in">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTab("expenses")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  tab === "expenses"
                    ? "bg-text-dark text-white"
                    : "bg-white text-text-mid shadow-[var(--shadow-card)]"
                }`}
              >
                All expenses
              </button>
              <button
                type="button"
                onClick={() => setTab("categories")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  tab === "categories"
                    ? "bg-text-dark text-white"
                    : "bg-white text-text-mid shadow-[var(--shadow-card)]"
                }`}
              >
                Categories
              </button>
            </div>
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              aria-label="Sort and filter"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-text-dark shadow-[var(--shadow-card)] transition hover:bg-bg-light"
            >
              <SlidersHorizontal size={18} />
              {tab === "expenses" && excludedCats.size > 0 && (
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-coral" />
              )}
            </button>
          </div>

          {/* Expenses list */}
          {tab === "expenses" &&
            (visibleExpenses.length === 0 ? (
              <p className="rounded-[20px] bg-white p-6 text-center text-sm text-text-muted shadow-[var(--shadow-card)]">
                {monthExpenses.length === 0
                  ? "No expenses this month yet."
                  : "No expenses match the selected categories."}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {visibleExpenses.map((e) => {
                  const color = colorFor(e.category, categories);
                  const Icon = iconFor(e.category, categories);
                  return (
                    <li
                      key={e.id}
                      className="flex items-center gap-3 rounded-[20px] bg-white p-3 shadow-[var(--shadow-card)]"
                    >
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]"
                        style={{ backgroundColor: `${color}1A`, color }}
                      >
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        {e.notes ? (
                          <>
                            <p className="truncate text-sm font-semibold text-text-dark">
                              {e.notes}
                            </p>
                            <p className="truncate text-xs text-text-muted">
                              {e.category}
                            </p>
                          </>
                        ) : (
                          <p className="truncate text-sm font-semibold text-text-dark">
                            {e.category}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-bold text-text-dark">
                        {formatMoney(e.amount)}
                      </span>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(e)}
                          aria-label="Edit expense"
                          className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition hover:bg-bg-light hover:text-text-dark"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(e.id)}
                          aria-label="Delete expense"
                          className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition hover:bg-coral/10 hover:text-coral"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ))}

          {/* Categories list */}
          {tab === "categories" &&
            (visibleCategories.length === 0 ? (
              <p className="rounded-[20px] bg-white p-6 text-center text-sm text-text-muted shadow-[var(--shadow-card)]">
                No categories yet. Add an expense to create one.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {visibleCategories.map((c) => {
                  const Icon = iconComp(c.icon);
                  return (
                  <li
                    key={c.id}
                    className="flex items-center gap-3 rounded-[20px] bg-white p-3 shadow-[var(--shadow-card)]"
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]"
                      style={{ backgroundColor: `${c.color}1A`, color: c.color }}
                    >
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text-dark">
                        {c.name}
                      </p>
                      <p className="truncate text-xs text-text-muted">
                        {c.count} {c.count === 1 ? "expense" : "expenses"} this
                        month
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-text-dark">
                      {formatMoney(c.total)}
                    </span>
                  </li>
                  );
                })}
              </ul>
            ))}
        </section>
      </main>

      <BottomNav onAdd={openAdd} onSettings={() => setSettingsOpen(true)} />

      {overlayOpen && (
        <AddExpenseOverlay
          categories={categories}
          expense={editing}
          onClose={() => setOverlayOpen(false)}
          onSaved={refreshExpenses}
          onCategoriesChanged={refreshCategories}
        />
      )}

      {filterOpen && (
        <FilterOverlay
          tab={tab}
          sortField={sortField}
          sortDir={sortDir}
          onSortFieldChange={setSortField}
          onToggleDir={() =>
            setSortDir((d) => (d === "up" ? "down" : "up"))
          }
          categories={categories}
          excluded={excludedCats}
          onToggleCategory={toggleCategoryFilter}
          onAllCategories={() => setExcludedCats(new Set())}
          onNoneCategories={() =>
            setExcludedCats(new Set(categories.map((c) => c.name)))
          }
          onClose={() => setFilterOpen(false)}
        />
      )}

      {settingsOpen && (
        <SettingsOverlay
          username={session.username}
          onGoCurrentMonth={goToCurrentMonth}
          onEditCategories={() => setEditCatsOpen(true)}
          onLogout={handleLogout}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {editCatsOpen && (
        <EditCategoriesOverlay
          categories={categories}
          onClose={() => setEditCatsOpen(false)}
          onChanged={async () => {
            await Promise.all([refreshCategories(), refreshExpenses()]);
          }}
        />
      )}
    </>
  );
}
