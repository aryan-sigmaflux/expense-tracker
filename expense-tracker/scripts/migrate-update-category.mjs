import pg from 'pg'
import { dbClient } from './db.mjs'
const { Client } = pg

const client = dbClient(Client)

const sql = `
create or replace function public.update_category(
  p_user_id uuid, p_id uuid, p_name text, p_color text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v jsonb;
  v_old  text;
  v_name text := trim(p_name);
begin
  select name into v_old
  from public.categories
  where id = p_id and user_id = p_user_id;

  if v_old is null then
    raise exception 'Category not found';
  end if;
  if v_name = '' then
    raise exception 'Category name is required';
  end if;
  if exists (
    select 1 from public.categories
    where user_id = p_user_id and lower(name) = lower(v_name) and id <> p_id
  ) then
    raise exception 'That category already exists';
  end if;

  update public.categories
     set name = v_name,
         color = coalesce(nullif(trim(p_color), ''), color)
   where id = p_id and user_id = p_user_id
  returning jsonb_build_object('id', id, 'name', name, 'color', color) into v;

  -- Keep existing expenses pointing at the renamed category.
  if v_old <> v_name then
    update public.expenses
       set category = v_name
     where user_id = p_user_id and category = v_old;
  end if;

  return v;
end;
$$;

revoke all on function public.update_category(uuid, uuid, text, text) from public;
grant execute on function public.update_category(uuid, uuid, text, text) to anon, authenticated;
`

await client.connect()
await client.query(sql)
console.log('✓ update_category applied.')
await client.end()
