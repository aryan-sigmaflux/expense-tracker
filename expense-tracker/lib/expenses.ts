import { supabase } from "./supabaseClient";
import { getSession } from "./auth";

export type Expense = {
  id: string;
  amount: number;
  category: string;
  notes: string | null;
  created_at: string;
};

export async function listExpenses(): Promise<Expense[]> {
  const session = getSession();
  if (!session) return [];
  const { data, error } = await supabase.rpc("list_expenses", {
    p_user_id: session.id,
  });
  if (error) throw new Error(error.message);
  return (data as Expense[]).map((e) => ({ ...e, amount: Number(e.amount) }));
}

export async function addExpense(input: {
  amount: number;
  category: string;
  notes?: string;
}): Promise<Expense> {
  const session = getSession();
  if (!session) throw new Error("Not signed in");
  const { data, error } = await supabase.rpc("add_expense", {
    p_user_id: session.id,
    p_amount: input.amount,
    p_category: input.category,
    p_notes: input.notes ?? null,
  });
  if (error) throw new Error(error.message);
  const e = data as Expense;
  return { ...e, amount: Number(e.amount) };
}

export async function updateExpense(
  id: string,
  input: { amount: number; category: string; notes?: string },
): Promise<Expense> {
  const session = getSession();
  if (!session) throw new Error("Not signed in");
  const { data, error } = await supabase.rpc("update_expense", {
    p_user_id: session.id,
    p_id: id,
    p_amount: input.amount,
    p_category: input.category,
    p_notes: input.notes ?? null,
  });
  if (error) throw new Error(error.message);
  const e = data as Expense;
  return { ...e, amount: Number(e.amount) };
}

export async function deleteExpense(id: string): Promise<void> {
  const session = getSession();
  if (!session) return;
  const { error } = await supabase.rpc("delete_expense", {
    p_user_id: session.id,
    p_id: id,
  });
  if (error) throw new Error(error.message);
}
