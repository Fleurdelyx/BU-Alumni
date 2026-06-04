-- RPCs for soft-delete / restore reply count synchronization

CREATE OR REPLACE FUNCTION public.decrement_reply_count(thread_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.forum_threads
  SET reply_count = GREATEST(reply_count - 1, 0)
  WHERE id = thread_uuid;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_reply_count_only(thread_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.forum_threads
  SET reply_count = reply_count + 1
  WHERE id = thread_uuid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_reply_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_reply_count(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_reply_count_only(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_reply_count_only(UUID) TO service_role;

-- Also ensure generate_thread_slug is callable by authenticated users
GRANT EXECUTE ON FUNCTION public.generate_thread_slug(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_thread_slug(TEXT) TO service_role;
