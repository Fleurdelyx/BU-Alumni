-- ============================================
-- 15. FORUM VOTING SYSTEM
-- ============================================

-- Add vote counts to threads
ALTER TABLE public.forum_threads
  ADD COLUMN IF NOT EXISTS upvotes INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS downvotes INT DEFAULT 0;

-- Add vote counts to replies
ALTER TABLE public.forum_replies
  ADD COLUMN IF NOT EXISTS upvotes INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS downvotes INT DEFAULT 0;

-- Create votes table (target_type: 'thread' or 'reply')
CREATE TABLE IF NOT EXISTS public.forum_votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('thread','reply')),
  target_id   UUID NOT NULL,
  vote_type   TEXT NOT NULL CHECK (vote_type IN ('up','down')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX forum_votes_target_idx ON public.forum_votes(target_type, target_id);

-- RLS policies for votes
ALTER TABLE public.forum_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "votes_read"   ON public.forum_votes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "votes_insert" ON public.forum_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votes_update" ON public.forum_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "votes_delete" ON public.forum_votes FOR DELETE USING (auth.uid() = user_id);

-- Function to apply a vote (handles toggle: same vote = remove, different vote = switch)
CREATE OR REPLACE FUNCTION public.apply_vote(
  p_user_id UUID,
  p_target_type TEXT,
  p_target_id UUID,
  p_vote_type TEXT
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  existing_vote TEXT;
  target_table TEXT;
  up_delta INT := 0;
  down_delta INT := 0;
BEGIN
  -- Validate
  IF p_target_type NOT IN ('thread','reply') THEN
    RETURN jsonb_build_object('error', 'Invalid target_type');
  END IF;
  IF p_vote_type NOT IN ('up','down') THEN
    RETURN jsonb_build_object('error', 'Invalid vote_type');
  END IF;

  -- Check existing vote
  SELECT vote_type INTO existing_vote
  FROM public.forum_votes
  WHERE user_id = p_user_id AND target_type = p_target_type AND target_id = p_target_id;

  IF existing_vote IS NULL THEN
    -- New vote
    INSERT INTO public.forum_votes (user_id, target_type, target_id, vote_type)
    VALUES (p_user_id, p_target_type, p_target_id, p_vote_type);
    IF p_vote_type = 'up' THEN up_delta := 1; ELSE down_delta := 1; END IF;
  ELSIF existing_vote = p_vote_type THEN
    -- Remove vote (toggle off)
    DELETE FROM public.forum_votes
    WHERE user_id = p_user_id AND target_type = p_target_type AND target_id = p_target_id;
    IF p_vote_type = 'up' THEN up_delta := -1; ELSE down_delta := -1; END IF;
  ELSE
    -- Switch vote
    UPDATE public.forum_votes
    SET vote_type = p_vote_type
    WHERE user_id = p_user_id AND target_type = p_target_type AND target_id = p_target_id;
    IF p_vote_type = 'up' THEN
      up_delta := 1; down_delta := -1;
    ELSE
      up_delta := -1; down_delta := 1;
    END IF;
  END IF;

  -- Update target counters
  IF p_target_type = 'thread' THEN
    UPDATE public.forum_threads
    SET upvotes = upvotes + up_delta,
        downvotes = downvotes + down_delta
    WHERE id = p_target_id;
  ELSE
    UPDATE public.forum_replies
    SET upvotes = upvotes + up_delta,
        downvotes = downvotes + down_delta
    WHERE id = p_target_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'up_delta', up_delta, 'down_delta', down_delta);
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_vote(UUID, TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_vote(UUID, TEXT, UUID, TEXT) TO service_role;
