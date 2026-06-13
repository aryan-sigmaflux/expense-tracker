import { supabase } from "./supabaseClient";
import { getSession } from "./auth";

export const CURRENCY = "₹";

export function formatMoney(amount: number): string {
  return `${CURRENCY}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

// Colors auto-assigned to newly created categories, cycled by creation order.
export const CATEGORY_PALETTE = [
  "#E8604C",
  "#2A7D6E",
  "#6C5CE7",
  "#F5A033",
  "#3BA9C7",
  "#E86CA8",
  "#FFD166",
  "#9B59B6",
  "#2BB673",
  "#5A5A6E",
];

export function nextPaletteColor(count: number): string {
  return CATEGORY_PALETTE[count % CATEGORY_PALETTE.length];
}

export type Category = {
  id: string;
  name: string;
  color: string;
};

export function colorFor(name: string, categories: Category[]): string {
  return (
    categories.find((c) => c.name.toLowerCase() === name.toLowerCase())?.color ??
    "#5A5A6E"
  );
}

export async function listCategories(): Promise<Category[]> {
  const session = getSession();
  if (!session) return [];
  const { data, error } = await supabase.rpc("list_categories", {
    p_user_id: session.id,
  });
  if (error) throw new Error(error.message);
  return data as Category[];
}

export async function addCategory(
  name: string,
  color: string,
): Promise<Category> {
  const session = getSession();
  if (!session) throw new Error("Not signed in");
  const { data, error } = await supabase.rpc("add_category", {
    p_user_id: session.id,
    p_name: name,
    p_color: color,
  });
  if (error) throw new Error(error.message);
  return data as Category;
}

export async function updateCategory(
  id: string,
  name: string,
  color: string,
): Promise<Category> {
  const session = getSession();
  if (!session) throw new Error("Not signed in");
  const { data, error } = await supabase.rpc("update_category", {
    p_user_id: session.id,
    p_id: id,
    p_name: name,
    p_color: color,
  });
  if (error) throw new Error(error.message);
  return data as Category;
}
