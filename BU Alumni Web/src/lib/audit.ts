import { createClient } from './supabase/client';

export async function logAuditEvent(
  action: string,
  targetType: string,
  targetId?: string,
  metadata?: Record<string, any>
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/log-audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
      },
      body: JSON.stringify({
        actor_id: user?.id,
        action,
        target_type: targetType,
        target_id: targetId,
        metadata,
      }),
    });
  } catch {
    // Silently fail — audit logging should not break user-facing flows
  }
}
