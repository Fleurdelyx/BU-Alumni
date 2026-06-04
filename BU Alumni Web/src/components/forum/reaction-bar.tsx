'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useState, useCallback } from 'react';

const REACTION_EMOJIS = ['👍', '❤️', '🎉', '💡', '🙏'];

interface ReactionBarProps {
  targetType: 'thread' | 'reply';
  targetId: string;
  userId: string | null;
  initialReactions?: Record<string, number>;
  initialUserReaction?: string | null;
  size?: 'sm' | 'md';
}

export function ReactionBar({
  targetType,
  targetId,
  userId,
  initialReactions = {},
  initialUserReaction = null,
  size = 'md',
}: ReactionBarProps) {
  const supabase = createClient();
  const [reactions, setReactions] = useState<Record<string, number>>(initialReactions);
  const [userReaction, setUserReaction] = useState<string | null>(initialUserReaction);

  const toggleReaction = useCallback(
    async (emoji: string) => {
      if (!userId) return;

      if (userReaction === emoji) {
        await supabase
          .from('forum_reactions')
          .delete()
          .eq('target_type', targetType)
          .eq('target_id', targetId)
          .eq('user_id', userId)
          .eq('emoji', emoji);
        setReactions((prev) => ({
          ...prev,
          [emoji]: Math.max((prev[emoji] || 0) - 1, 0),
        }));
        setUserReaction(null);
      } else {
        if (userReaction) {
          await supabase
            .from('forum_reactions')
            .delete()
            .eq('target_type', targetType)
            .eq('target_id', targetId)
            .eq('user_id', userId);
          setReactions((prev) => ({
            ...prev,
            [userReaction]: Math.max((prev[userReaction] || 0) - 1, 0),
          }));
        }
        await supabase.from('forum_reactions').insert({
          target_type: targetType,
          target_id: targetId,
          user_id: userId,
          emoji,
        });
        setReactions((prev) => ({
          ...prev,
          [emoji]: (prev[emoji] || 0) + 1,
        }));
        setUserReaction(emoji);
      }
    },
    [supabase, targetType, targetId, userId, userReaction]
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {REACTION_EMOJIS.map((emoji) => (
        <Button
          key={emoji}
          variant={userReaction === emoji ? 'default' : 'outline'}
          size={size === 'sm' ? 'sm' : 'default'}
          className={size === 'sm' ? 'h-7 px-1.5 gap-0.5 text-xs' : 'h-8 px-2 gap-1'}
          onClick={() => toggleReaction(emoji)}
          disabled={!userId}
        >
          <span>{emoji}</span>
          <span className="text-xs">{reactions[emoji] || 0}</span>
        </Button>
      ))}
    </div>
  );
}
