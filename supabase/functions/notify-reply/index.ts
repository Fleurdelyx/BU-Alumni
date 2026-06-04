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
    const { record } = await req.json();

    if (!record || typeof record !== 'object' || !record.thread_id || !record.author_id) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
    }

    const { thread_id, author_id, parent_id, id: reply_id } = record;

    // Verify the actor matches the authenticated user
    if (author_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    // Get thread info
    const { data: thread } = await supabase
      .from('forum_threads')
      .select('author_id, title')
      .eq('id', thread_id)
      .single();

    if (!thread) return new Response('OK');

    // Notify thread author (if not self-replying)
    if (thread.author_id !== author_id) {
      await supabase.from('notifications').insert({
        recipient_id: thread.author_id,
        actor_id: author_id,
        type: 'reply',
        thread_id,
        reply_id,
        message: `replied to your thread "${thread.title}"`,
      });
    }

    // If this is a reply to another reply, notify the parent reply author
    if (parent_id) {
      const { data: parent } = await supabase
        .from('forum_replies')
        .select('author_id')
        .eq('id', parent_id)
        .single();

      if (parent && parent.author_id !== author_id && parent.author_id !== thread.author_id) {
        await supabase.from('notifications').insert({
          recipient_id: parent.author_id,
          actor_id: author_id,
          type: 'reply',
          thread_id,
          reply_id,
          message: `replied to your comment in "${thread.title}"`,
        });
      }
    }

    // Update thread's last_reply_at, reply_count, and last_reply_by
    await supabase.rpc('increment_reply_count', { thread_uuid: thread_id, author_uuid: author_id });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('notify-reply error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
