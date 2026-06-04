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
    const body = await req.json();

    if (!body || typeof body !== 'object' || !body.action || !body.target_type) {
      return new Response(JSON.stringify({ error: 'Invalid payload: action and target_type are required' }), { status: 400 });
    }

    const { action, target_id, target_type, metadata } = body;

    // Enforce actor_id matches authenticated user
    const actor_id = user.id;

    const { error } = await supabase.from('audit_logs').insert({
      actor_id,
      action,
      target_id,
      target_type,
      metadata: metadata || {},
      ip_address: req.headers.get('x-forwarded-for') || null,
      user_agent: req.headers.get('user-agent') || null,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('log-audit error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
