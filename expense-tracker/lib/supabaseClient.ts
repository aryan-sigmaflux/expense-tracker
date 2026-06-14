import { createClient } from '@supabase/supabase-js'

const directUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

// In the browser, route requests through our own origin (the `/sb` proxy in
// next.config.ts) so the client never resolves `*.supabase.co` — some ISP DNS
// resolvers fail to, breaking every RPC. Server-side we hit Supabase directly.
const supabaseUrl =
  typeof window !== "undefined" ? `${window.location.origin}/sb` : directUrl

// Plain client used only to call our SECURITY DEFINER RPCs (signup_user /
// verify_login). We do NOT use Supabase Auth — login is pure username +
// password against the public.app_users table.
export const supabase = createClient(supabaseUrl, supabaseKey)
