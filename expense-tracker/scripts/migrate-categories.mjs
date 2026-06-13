import pg from 'pg'
import { dbClient } from './db.mjs'
const { Client } = pg

const client = dbClient(Client)

const sql = `
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.app_users(id) on delete cascade,
  name       text not null,
  color      text not null default '#5A5A6E',
  created_at timestamptz not null default now()
);
create unique index if not exists categories_user_name_idx
  on public.categories (user_id, lower(name));

alter table public.categories enable row level security;
revoke all on table public.categories from anon, authenticated;

create or replace function public.list_categories(p_user_id uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(c order by c.name), '[]'::jsonb)
  from (
    select id, name, color from public.categories where user_id = p_user_id
  ) c;
$$;

create or replace function public.add_category(p_user_id uuid, p_name text, p_color text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v jsonb;
  v_name text := trim(p_name);
begin
  if v_name = '' then
    raise exception 'Category name is required';
  end if;
  if exists (
    select 1 from public.categories
    where user_id = p_user_id and lower(name) = lower(v_name)
  ) then
    raise exception 'That category already exists';
  end if;
  insert into public.categories (user_id, name, color)
  values (p_user_id, v_name, coalesce(nullif(trim(p_color), ''), '#5A5A6E'))
  returning jsonb_build_object('id', id, 'name', name, 'color', color) into v;
  return v;
end;
$$;

create or replace function public.update_expense(
  p_user_id uuid, p_id uuid, p_amount numeric, p_category text, p_notes text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v jsonb;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be greater than 0';
  end if;
  if coalesce(trim(p_category), '') = '' then
    raise exception 'Category is required';
  end if;
  update public.expenses
     set amount = p_amount,
         category = trim(p_category),
         notes = nullif(trim(coalesce(p_notes, '')), '')
   where id = p_id and user_id = p_user_id
  returning jsonb_build_object(
    'id', id, 'amount', amount, 'category', category,
    'notes', notes, 'created_at', created_at
  ) into v;
  if v is null then
    raise exception 'Expense not found';
  end if;
  return v;
end;
$$;

revoke all on function public.list_categories(uuid) from public;
revoke all on function public.add_category(uuid, text, text) from public;
revoke all on function public.update_expense(uuid, uuid, numeric, text, text) from public;
grant execute on function public.list_categories(uuid) to anon, authenticated;
grant execute on function public.add_category(uuid, text, text) to anon, authenticated;
grant execute on function public.update_expense(uuid, uuid, numeric, text, text) to anon, authenticated;

-- Backfill categories from any categories already used in expenses.
insert into public.categories (user_id, name, color)
select e.user_id, e.category,
  case e.category
    when 'Food' then '#E8604C'
    when 'Transport' then '#2A7D6E'
    when 'Shopping' then '#6C5CE7'
    when 'Bills' then '#F5A033'
    when 'Entertainment' then '#3BA9C7'
    when 'Health' then '#E86CA8'
    else '#5A5A6E'
  end
from (select distinct user_id, category from public.expenses) e
on conflict (user_id, lower(name)) do nothing;
`

await client.connect()
await client.query(sql)
const r = await client.query('select count(*)::int as n from public.categories')
console.log('✓ Categories schema applied. Category rows:', r.rows[0].n)
await client.end()
