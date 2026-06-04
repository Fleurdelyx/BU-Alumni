-- Fix missing RPC called by notify-reply edge function
-- Also updates last_reply_at and last_reply_by for thread list sorting

CREATE OR REPLACE FUNCTION public.increment_reply_count(thread_uuid UUID, author_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.forum_threads
  SET
    reply_count = reply_count + 1,
    last_reply_at = NOW(),
    last_reply_by = author_uuid
  WHERE id = thread_uuid;
END;
$$;

-- Grant execute to authenticated users (edge function uses service role, but good practice)
GRANT EXECUTE ON FUNCTION public.increment_reply_count(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_reply_count(UUID, UUID) TO service_role;
