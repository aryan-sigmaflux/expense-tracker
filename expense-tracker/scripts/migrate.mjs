import pg from 'pg'
import { dbClient } from './db.mjs'
const { Client } = pg

const client = dbClient(Client)

const sql = `
create extension if not exists pgcrypto with schema extensions;

-- Username + bcrypt-hashed password. No email anywhere.
create table if not exists public.app_users (
  id            uuid primary key default gen_random_uuid(),
  username      text unique not null,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

-- Lock the table down: anon/authenticated can never read hashes directly.
-- Access happens only through the SECURITY DEFINER functions below.
alter table public.app_users enable row level security;
revoke all on table public.app_users from anon, authenticated;

-- Create a new account. Returns { id, username }.
create or replace function public.signup_user(p_username text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id   uuid;
  v_user text := lower(trim(p_username));
begin
  if v_user = '' or coalesce(p_password, '') = '' then
    raise exception 'Login ID and password are required';
  end if;
  if exists (select 1 from public.app_users where username = v_user) then
    raise exception 'That login ID is already taken';
  end if;
  insert into public.app_users (username, password_hash)
  values (v_user, crypt(p_password, gen_salt('bf')))
  returning id into v_id;
  return jsonb_build_object('id', v_id, 'username', v_user);
end;
$$;

-- Verify credentials. Returns { id, username } on success, null otherwise.
create or replace function public.verify_login(p_username text, p_password text)
returns jsonb
language sql
security definer
set search_path = public, extensions
as $$
  select jsonb_build_object('id', id, 'username', username)
  from public.app_users
  where username = lower(trim(p_username))
    and password_hash = crypt(p_password, password_hash)
  limit 1;
$$;

revoke all on function public.signup_user(text, text) from public;
revoke all on function public.verify_login(text, text) from public;
grant execute on function public.signup_user(text, text) to anon, authenticated;
grant execute on function public.verify_login(text, text) to anon, authenticated;

-- Pre-seed the namze account (idempotent).
insert into public.app_users (username, password_hash)
values ('namze', crypt('1Uttamaryan', gen_salt('bf')))
on conflict (username) do nothing;
`

await client.connect()
await client.query(sql)
const seeded = await client.query(
  "select jsonb_build_object('id', id, 'username', username) as u from public.app_users"
)
console.log('✓ Migration applied. Users:', seeded.rows.map((r) => r.u))

// Sanity-check the login function end to end.
const ok = await client.query("select public.verify_login('namze','1Uttamaryan') as r")
const bad = await client.query("select public.verify_login('namze','wrong') as r")
console.log('verify namze/correct ->', ok.rows[0].r)
console.log('verify namze/wrong   ->', bad.rows[0].r)

await client.end()
