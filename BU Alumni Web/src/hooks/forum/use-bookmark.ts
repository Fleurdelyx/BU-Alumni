'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useBookmark() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const checkBookmarked = useCallback(
    async (threadId: string, userId: string) => {
      const { data } = await supabase
        .from('forum_bookmarks')
        .select('id')
        .eq('thread_id', threadId)
        .eq('user_id', userId)
        .maybeSingle();
      return !!data;
    },
    [supabase]
  );

  const toggleBookmark = useCallback(
    async (threadId: string, userId: string, isBookmarked: boolean) => {
      setLoading(true);
      try {
        if (isBookmarked) {
          await supabase.from('forum_bookmarks').delete().eq('thread_id', threadId).eq('user_id', userId);
          return false;
        } else {
          await supabase.from('forum_bookmarks').insert({ thread_id: threadId, user_id: userId });
          return true;
        }
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  return { checkBookmarked, toggleBookmark, loading };
}
