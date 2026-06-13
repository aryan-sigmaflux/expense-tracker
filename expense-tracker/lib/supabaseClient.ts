import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

// Plain client used only to call our SECURITY DEFINER RPCs (signup_user /
// verify_login). We do NOT use Supabase Auth — login is pure username +
// password against the public.app_users table.
export const supabase = createClient(supabaseUrl, supabaseKey)
