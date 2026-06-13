import pg from 'pg'
import { dbClient } from './db.mjs'
const { Client } = pg

const client = dbClient(Client)

const sql = `
create table if not exists public.expenses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.app_users(id) on delete cascade,
  amount     numeric(12,2) not null check (amount >= 0),
  category   text not null,
  notes      text,
  created_at timestamptz not null default now()
);
create index if not exists expenses_user_created_idx
  on public.expenses (user_id, created_at desc);

-- Lock direct access; everything goes through the RPCs below.
alter table public.expenses enable row level security;
revoke all on table public.expenses from anon, authenticated;

-- Add an expense for a user. Returns the new row as jsonb.
create or replace function public.add_expense(
  p_user_id uuid, p_amount numeric, p_category text, p_notes text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v jsonb;
begin
  if not exists (select 1 from public.app_users where id = p_user_id) then
    raise exception 'Unknown user';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be greater than 0';
  end if;
  if coalesce(trim(p_category), '') = '' then
    raise exception 'Category is required';
  end if;
  insert into public.expenses (user_id, amount, category, notes)
  values (p_user_id, p_amount, trim(p_category), nullif(trim(coalesce(p_notes, '')), ''))
  returning jsonb_build_object(
    'id', id, 'amount', amount, 'category', category,
    'notes', notes, 'created_at', created_at
  ) into v;
  return v;
end;
$$;

-- List a user's expenses, newest first.
create or replace function public.list_expenses(p_user_id uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(e order by e.created_at desc), '[]'::jsonb)
  from (
    select id, amount, category, notes, created_at
    from public.expenses
    where user_id = p_user_id
  ) e;
$$;

-- Delete one of a user's expenses.
create or replace function public.delete_expense(p_user_id uuid, p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.expenses where id = p_id and user_id = p_user_id;
$$;

revoke all on function public.add_expense(uuid, numeric, text, text) from public;
revoke all on function public.list_expenses(uuid) from public;
revoke all on function public.delete_expense(uuid, uuid) from public;
grant execute on function public.add_expense(uuid, numeric, text, text) to anon, authenticated;
grant execute on function public.list_expenses(uuid) to anon, authenticated;
grant execute on function public.delete_expense(uuid, uuid) to anon, authenticated;
`

await client.connect()
await client.query(sql)
console.log('✓ Expenses schema applied.')
await client.end()
