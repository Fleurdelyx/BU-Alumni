'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useThreadMutation() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const createThread = useCallback(
    async (values: {
      category_id: string;
      author_id: string;
      title: string;
      body: string;
      body_plain: string;
      tags: string[];
    }) => {
      setLoading(true);
      try {
        const { data: slugData } = await supabase.rpc('generate_thread_slug', {
          title: values.title,
        });
        const slug = slugData || values.title.toLowerCase().replace(/\s+/g, '-');

        const { data, error } = await supabase
          .from('forum_threads')
          .insert({
            ...values,
            slug,
          })
          .select('*, author:profiles(*), category:forum_categories(*)')
          .single();
        if (error) throw error;
        return data;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const updateThread = useCallback(
    async (
      threadId: string,
      values: {
        title?: string;
        body?: string;
        body_plain?: string;
        category_id?: string;
        tags?: string[];
        is_pinned?: boolean;
        is_locked?: boolean;
        is_solved?: boolean;
      }
    ) => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('forum_threads')
          .update({
            ...values,
            updated_at: new Date().toISOString(),
          })
          .eq('id', threadId)
          .select('*, author:profiles(*), category:forum_categories(*)')
          .single();
        if (error) throw error;
        return data;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const softDeleteThread = useCallback(
    async (threadId: string) => {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('forum_threads')
          .update({ is_deleted: true })
          .eq('id', threadId);
        if (error) throw error;
        return true;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const restoreThread = useCallback(
    async (threadId: string) => {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('forum_threads')
          .update({ is_deleted: false })
          .eq('id', threadId);
        if (error) throw error;
        return true;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  return {
    createThread,
    updateThread,
    softDeleteThread,
    restoreThread,
    loading,
  };
}
