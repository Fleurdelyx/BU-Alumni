import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createSupabaseAdmin, verifyUser } from '../_shared/auth.ts';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const { user, error: authError } = await verifyUser(req);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const supabase = createSupabaseAdmin();

  try {
    const { title } = await req.json();
    if (!title || typeof title !== 'string') {
      return new Response(JSON.stringify({ error: 'Title required' }), { status: 400 });
    }

    const { data } = await supabase.rpc('generate_thread_slug', { title });

    return new Response(JSON.stringify({ slug: data }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
