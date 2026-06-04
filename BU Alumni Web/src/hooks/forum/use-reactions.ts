'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useReactions() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const fetchReactions = useCallback(
    async (targetType: 'thread' | 'reply', targetIds: string[]) => {
      if (!targetIds.length) return {};
      const { data } = await supabase
        .from('forum_reactions')
        .select('target_id, emoji')
        .eq('target_type', targetType)
        .in('target_id', targetIds);

      const agg: Record<string, Record<string, number>> = {};
      (data || []).forEach((r) => {
        if (!agg[r.target_id]) agg[r.target_id] = {};
        agg[r.target_id][r.emoji] = (agg[r.target_id][r.emoji] || 0) + 1;
      });
      return agg;
    },
    [supabase]
  );

  const fetchUserReaction = useCallback(
    async (targetType: 'thread' | 'reply', targetId: string, userId: string) => {
      const { data } = await supabase
        .from('forum_reactions')
        .select('emoji')
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .eq('user_id', userId)
        .maybeSingle();
      return data?.emoji || null;
    },
    [supabase]
  );

  const toggleReaction = useCallback(
    async (
      targetType: 'thread' | 'reply',
      targetId: string,
      userId: string,
      emoji: string,
      currentReaction: string | null
    ) => {
      setLoading(true);
      try {
        if (currentReaction === emoji) {
          await supabase
            .from('forum_reactions')
            .delete()
            .eq('target_type', targetType)
            .eq('target_id', targetId)
            .eq('user_id', userId)
            .eq('emoji', emoji);
          return null;
        } else {
          if (currentReaction) {
            await supabase
              .from('forum_reactions')
              .delete()
              .eq('target_type', targetType)
              .eq('target_id', targetId)
              .eq('user_id', userId);
          }
          await supabase.from('forum_reactions').insert({
            target_type: targetType,
            target_id: targetId,
            user_id: userId,
            emoji,
          });
          return emoji;
        }
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  return { fetchReactions, fetchUserReaction, toggleReaction, loading };
}
