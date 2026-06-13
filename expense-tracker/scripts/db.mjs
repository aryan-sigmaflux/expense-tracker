// Builds a direct Postgres connection from .env.local (no secrets in source).
// Expects: NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
//          supabase=<database password>
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const ref = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0]
const password = env.supabase

export function dbClient(Client) {
  return new Client({
    host: `db.${ref}.supabase.co`,
    port: 5432,
    user: 'postgres',
    password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  })
}
