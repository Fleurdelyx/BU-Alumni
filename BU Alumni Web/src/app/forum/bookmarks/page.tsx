'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { ThreadCard } from '@/components/forum/thread-card';
import { Pagination } from '@/components/forum/pagination';
import { Button } from '@/components/ui/button';
import type { ForumThread } from '@/lib/types';
import { Bookmark } from 'lucide-react';

const PER_PAGE = 20;

type ThreadWithAuthor = ForumThread & { author: { full_name: string; avatar_url: string | null } | null };

export default function BookmarksPage() {
  const supabase = createClient();
  const [threads, setThreads] = useState<ThreadWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  async function loadBookmarks(pageNum: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUserId(null);
      setLoading(false);
      return;
    }
    setUserId(user.id);

    const start = pageNum * PER_PAGE;
    const end = start + PER_PAGE - 1;

    const { data, count } = await supabase
      .from('forum_bookmarks')
      .select('thread:forum_threads(*, author:profiles(full_name, avatar_url), category:forum_categories(*))', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(start, end);

    const flattened = (data || [])
      .map((d: any) => d.thread)
      .filter(Boolean)
      .filter((t: any) => !t.is_deleted) as ThreadWithAuthor[];

    if (pageNum === 0) {
      setThreads(flattened);
    } else {
      setThreads((prev) => [...prev, ...flattened]);
    }
    setHasMore((count || 0) > (pageNum + 1) * PER_PAGE);
    setLoading(false);
  }

  useEffect(() => {
    loadBookmarks(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadBookmarks(nextPage);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold font-display">My Bookmarks</h1>
          <p className="text-slate mt-1">Threads you&apos;ve saved for later.</p>
        </div>

        {loading && threads.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : !userId ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg text-slate">
            <Bookmark className="h-8 w-8 mx-auto mb-2 text-slate" />
            <p>Please sign in to view your bookmarks.</p>
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg text-slate">
            <Bookmark className="h-8 w-8 mx-auto mb-2 text-slate" />
            <p>You haven&apos;t bookmarked any threads yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                category={thread.category}
              />
            ))}
          </div>
        )}

        <Pagination hasMore={hasMore} onLoadMore={handleLoadMore} loading={loading && threads.length > 0} />
      </div>
    </AppLayout>
  );
}
