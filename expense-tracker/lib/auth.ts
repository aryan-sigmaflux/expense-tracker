import { supabase } from './supabaseClient'

// Our own lightweight session. Stored in localStorage so it survives forever in
// this browser until an explicit logout — i.e. "never logs out in that browser".
const SESSION_KEY = 'expense_tracker_session'

export type Session = {
  id: string
  username: string
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

function setSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

type AuthResult = { ok: true; session: Session } | { ok: false; error: string }

export async function login(username: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.rpc('verify_login', {
    p_username: username,
    p_password: password,
  })
  if (error) return { ok: false, error: error.message }
  if (!data) return { ok: false, error: 'Incorrect login ID or password.' }
  const session = data as Session
  setSession(session)
  return { ok: true, session }
}

export async function signup(username: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.rpc('signup_user', {
    p_username: username,
    p_password: password,
  })
  if (error) return { ok: false, error: error.message }
  const session = data as Session
  setSession(session)
  return { ok: true, session }
}
