'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useReplyMutation() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const createReply = useCallback(
    async (threadId: string, authorId: string, body: string, bodyPlain: string, parentId?: string | null) => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('forum_replies')
          .insert({
            thread_id: threadId,
            author_id: authorId,
            body: body.trim(),
            body_plain: bodyPlain.trim(),
            parent_id: parentId || null,
          })
          .select('*, author:profiles(*)')
          .single();
        if (error) throw error;
        if (!data) throw new Error('Reply was created but could not be retrieved.');
        // Auto-upvote author's own reply
        await supabase.rpc('apply_vote', {
          p_user_id: authorId,
          p_target_type: 'reply',
          p_target_id: data.id,
          p_vote_type: 'up',
        });
        return { ...data, upvotes: (data.upvotes || 0) + 1 };
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const updateReply = useCallback(
    async (replyId: string, body: string, bodyPlain: string) => {
      setLoading(true);
      try {
        const { data: current } = await supabase
          .from('forum_replies')
          .select('edit_count')
          .eq('id', replyId)
          .single();
        const { data, error } = await supabase
          .from('forum_replies')
          .update({
            body: body.trim(),
            body_plain: bodyPlain.trim(),
            edit_count: (current?.edit_count || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', replyId)
          .select('*, author:profiles(*)')
          .single();
        if (error) throw error;
        return data;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const softDeleteReply = useCallback(
    async (replyId: string) => {
      setLoading(true);
      try {
        const { data: reply } = await supabase
          .from('forum_replies')
          .select('thread_id')
          .eq('id', replyId)
          .single();
        const { error } = await supabase
          .from('forum_replies')
          .update({ is_deleted: true })
          .eq('id', replyId);
        if (error) throw error;
        if (reply?.thread_id) {
          await supabase.rpc('decrement_reply_count', { thread_uuid: reply.thread_id });
        }
        return true;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const restoreReply = useCallback(
    async (replyId: string) => {
      setLoading(true);
      try {
        const { data: reply } = await supabase
          .from('forum_replies')
          .select('thread_id')
          .eq('id', replyId)
          .single();
        const { error } = await supabase
          .from('forum_replies')
          .update({ is_deleted: false })
          .eq('id', replyId);
        if (error) throw error;
        if (reply?.thread_id) {
          await supabase.rpc('increment_reply_count_only', { thread_uuid: reply.thread_id });
        }
        return true;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const markAsAnswer = useCallback(
    async (replyId: string, threadId: string) => {
      setLoading(true);
      try {
        await supabase
          .from('forum_replies')
          .update({ is_accepted: false })
          .eq('thread_id', threadId);
        const { data, error } = await supabase
          .from('forum_replies')
          .update({ is_accepted: true })
          .eq('id', replyId)
          .select('*, author:profiles(*)')
          .single();
        if (error) throw error;
        return data;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  return {
    createReply,
    updateReply,
    softDeleteReply,
    restoreReply,
    markAsAnswer,
    loading,
  };
}
