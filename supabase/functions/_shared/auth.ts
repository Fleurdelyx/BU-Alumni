import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

export function createSupabaseAdmin() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Missing Supabase credentials');
  return createClient(url, key);
}

export async function verifyUser(req: Request) {
  const authHeader = req.headers.get('Authorization');
  const apiKey = req.headers.get('apikey');
  if (!authHeader) return { user: null, error: 'Missing Authorization header' };

  const token = authHeader.replace('Bearer ', '');
  const supabase = createSupabaseAdmin();

  // Try getUser first (server-side validation)
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (user) return { user, error: null };

  // Fallback: validate JWT locally via setSession + getSession
  if (!error || error.message?.includes('token')) {
    const { data: { session } } = await supabase.auth.setSession({ access_token: token, refresh_token: '' });
    if (session?.user) return { user: session.user, error: null };
  }

  return { user: null, error: error?.message || 'Invalid token' };
}

const ALLOWED_ORIGINS = [
  'https://alumni.baliuag.edu.ph',
  'https://bu-alumni-web.vercel.app',
  'http://localhost:3000',
];

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow any Vercel preview deployment
  if (origin.endsWith('.vercel.app')) return true;
  return false;
}

export function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowed = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}
