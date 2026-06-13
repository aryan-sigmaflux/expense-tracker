"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { getSession } from "@/lib/auth";
import { listExpenses, type Expense } from "@/lib/expenses";
import { formatMoney } from "@/lib/categories";
import {
  monthKey,
  currentMonthKey,
  parseMonthKey,
  monthLabel,
  getSelectedMonth,
  setSelectedMonth,
  addMonths,
  monthsUpTo,
  monthGrid,
} from "@/lib/dates";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function CalendarPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selected, setSelected] = useState(currentMonthKey());
  const [viewMonth, setViewMonth] = useState(currentMonthKey());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    const initial = getSelectedMonth();
    setSelected(initial);
    setViewMonth(initial);
    listExpenses()
      .then(setExpenses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  // Per-month totals and which days of the viewed month have expenses.
  const monthTotals = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of expenses) {
      const k = monthKey(e.created_at);
      m.set(k, (m.get(k) ?? 0) + e.amount);
    }
    return m;
  }, [expenses]);

  const daysWithData = useMemo(() => {
    const set = new Set<number>();
    for (const e of expenses) {
      if (monthKey(e.created_at) === viewMonth) {
        set.add(new Date(e.created_at).getDate());
      }
    }
    return set;
  }, [expenses, viewMonth]);

  // Month list: from the earliest month with data (min 12 months back) to now.
  const months = useMemo(() => {
    const cur = currentMonthKey();
    const earliestData = [...monthTotals.keys()].sort()[0];
    const start =
      earliestData && earliestData < addMonths(cur, -11)
        ? earliestData
        : addMonths(cur, -11);
    return monthsUpTo(start, cur).reverse(); // newest first
  }, [monthTotals]);

  const grid = useMemo(() => monthGrid(viewMonth), [viewMonth]);
  const todayKey = currentMonthKey();
  const today = new Date().getDate();
  const atCurrentMonth = viewMonth >= todayKey;

  function go(monthKeyValue: string) {
    setSelectedMonth(monthKeyValue);
    router.push("/");
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-text-muted">Loading…</p>
      </main>
    );
  }

  const { year: vYear, month: vMonth } = parseMonthKey(viewMonth);

  return (
    <main className="mx-auto w-full max-w-[480px] flex-1 px-5 pb-10 pt-6">
      {/* Header */}
      <header className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => go(selected)}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-dark shadow-[var(--shadow-card)]"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-text-dark">
          Calendar
        </h1>
      </header>

      {/* Calendar card */}
      <section className="animate-in mb-6 rounded-[32px] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewMonth((m) => addMonths(m, -1))}
            aria-label="Previous month"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-light text-text-dark transition hover:bg-border"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <p className="text-base font-bold text-text-dark">
              {new Date(vYear, vMonth, 1).toLocaleString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="text-xs font-medium text-text-muted">
              {formatMoney(monthTotals.get(viewMonth) ?? 0)} spent
            </p>
          </div>
          <button
            type="button"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            disabled={atCurrentMonth}
            aria-label="Next month"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-light text-text-dark transition hover:bg-border disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Weekday row */}
        <div className="mb-1 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((w, i) => (
            <span
              key={i}
              className="py-1 text-center text-xs font-semibold text-text-muted"
            >
              {w}
            </span>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {grid.map((day, i) => {
            const isToday = viewMonth === todayKey && day === today;
            const hasData = day !== null && daysWithData.has(day);
            return (
              <div
                key={i}
                className={`relative flex aspect-square items-center justify-center rounded-[12px] text-sm ${
                  day === null
                    ? ""
                    : isToday
                      ? "bg-text-dark font-bold text-white"
                      : "text-text-dark"
                }`}
              >
                {day ?? ""}
                {hasData && !isToday && (
                  <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-coral" />
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => go(viewMonth)}
          className="mt-5 w-full rounded-full bg-coral py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Show {monthLabel(viewMonth)}
        </button>
      </section>

      {/* Month list */}
      <section className="animate-in">
        <h2 className="mb-3 px-1 text-base font-bold text-text-dark">
          Jump to month
        </h2>
        <ul className="flex flex-col gap-2">
          {months.map((m) => {
            const isSelected = m === selected;
            return (
              <li key={m}>
                <button
                  type="button"
                  onClick={() => go(m)}
                  className={`flex w-full items-center justify-between rounded-[18px] border bg-white px-4 py-3 text-left shadow-[var(--shadow-card)] transition ${
                    isSelected ? "border-coral" : "border-transparent"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-text-dark">
                      {new Date(
                        parseMonthKey(m).year,
                        parseMonthKey(m).month,
                        1,
                      ).toLocaleString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                      {m === todayKey && (
                        <span className="ml-2 text-xs font-medium text-coral">
                          This month
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatMoney(monthTotals.get(m) ?? 0)} spent
                    </p>
                  </div>
                  {isSelected && <Check size={18} className="text-coral" />}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
