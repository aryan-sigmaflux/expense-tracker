// Month keys are "YYYY-MM" — lexicographic order matches chronological order.

export function monthKey(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}

export function currentMonthKey(): string {
  return monthKey(new Date());
}

export function parseMonthKey(key: string): { year: number; month: number } {
  const [y, m] = key.split("-").map(Number);
  return { year: y, month: m - 1 };
}

export function isFutureMonth(key: string): boolean {
  return key > currentMonthKey();
}

export function addMonths(key: string, delta: number): string {
  const { year, month } = parseMonthKey(key);
  const d = new Date(year, month + delta, 1);
  return monthKey(d);
}

// Full month name, with year appended only when it differs from this year.
export function monthLabel(key: string, opts?: { short?: boolean }): string {
  const { year, month } = parseMonthKey(key);
  const d = new Date(year, month, 1);
  const name = d.toLocaleString("en-US", {
    month: opts?.short ? "short" : "long",
  });
  return year === new Date().getFullYear() ? name : `${name} ${year}`;
}

// Inclusive list of month keys from startKey up to endKey (chronological).
export function monthsUpTo(startKey: string, endKey: string): string[] {
  const res: string[] = [];
  let { year, month } = parseMonthKey(startKey);
  const end = parseMonthKey(endKey);
  while (year < end.year || (year === end.year && month <= end.month)) {
    res.push(`${year}-${String(month + 1).padStart(2, "0")}`);
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }
  return res;
}

// Selected month is kept in localStorage (not the URL) so paths stay clean.
const SELECTED_MONTH_KEY = "expense_tracker_month";

export function getSelectedMonth(): string {
  if (typeof window === "undefined") return currentMonthKey();
  const v = localStorage.getItem(SELECTED_MONTH_KEY);
  return v && !isFutureMonth(v) ? v : currentMonthKey();
}

export function setSelectedMonth(key: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(SELECTED_MONTH_KEY, key);
  }
}

// 6x7 grid of day numbers for a month; nulls pad leading/trailing blanks.
export function monthGrid(key: string): (number | null)[] {
  const { year, month } = parseMonthKey(key);
  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
