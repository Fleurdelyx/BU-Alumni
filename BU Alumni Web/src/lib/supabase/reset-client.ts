import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[BU Alumni] Missing Supabase environment variables for reset client.'
  );
}

/**
 * A browser client dedicated to the password-reset flow.
 *
 * The SSR browser client forces `flowType: 'pkce'`, which conflicts with the
 * implicit-grant tokens (`#access_token=...&refresh_token=...`) that Supabase
 * sends in recovery links. This client uses implicit flow and does not try to
 * auto-detect the session from the URL, so we can parse the tokens ourselves
 * and call `setSession` explicitly.
 */
export function createResetClient() {
  return createSupabaseClient(supabaseUrl!, supabaseKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: 'implicit',
    },
  });
}
