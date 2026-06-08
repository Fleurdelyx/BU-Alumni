import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[BU Alumni] Missing Supabase environment variables.\n' +
      'Copy .env.example to .env.local and fill in your project URL and anon key.\n' +
      'Get them from: https://supabase.com/dashboard → Project Settings → API'
  );
}

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
