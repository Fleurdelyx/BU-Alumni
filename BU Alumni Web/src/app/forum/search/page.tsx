'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ThreadCard } from '@/components/forum/thread-card';
import { Pagination } from '@/components/forum/pagination';
import type { ForumThread } from '@/lib/types';
import { Search } from 'lucide-react';

const RESULTS_PER_PAGE = 20;

type ThreadWithAuthor = ForumThread & { author: { full_name: string; avatar_url: string | null } | null };

function ForumSearchContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ThreadWithAuthor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const performSearch = useCallback(
    async (searchQuery: string, pageNum: number) => {
      if (!searchQuery.trim()) return;
      setLoading(true);
      setSearched(true);

      const start = pageNum * RESULTS_PER_PAGE;
      const end = start + RESULTS_PER_PAGE - 1;

      const { data, count } = await supabase
        .from('forum_threads')
        .select('*, author:profiles(full_name, avatar_url), category:forum_categories(*)', { count: 'exact' })
        .eq('is_deleted', false)
        .textSearch('search_vector', searchQuery, {
          type: 'websearch',
          config: 'english',
        })
        .range(start, end);

      if (pageNum === 0) {
        setResults((data || []) as ThreadWithAuthor[]);
      } else {
        setResults((prev) => [...prev, ...(data || []) as ThreadWithAuthor[]]);
      }
      setHasMore((count || 0) > (pageNum + 1) * RESULTS_PER_PAGE);
      setLoading(false);
    },
    [supabase]
  );

  useEffect(() => {
    if (initialQuery) {
      setPage(0);
      performSearch(initialQuery, 0);
    }
  }, [initialQuery, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    performSearch(query, 0);
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    window.history.replaceState({}, '', url);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(query, nextPage);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold font-display">Search Forum</h1>
          <p className="text-slate mt-1">Find discussions across all categories.</p>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate" />
          <Input
            placeholder="Search threads..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        {loading && results.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : searched && results.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg text-slate">
            No results found for &quot;{query}&quot;.
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                category={thread.category}
              />
            ))}
          </div>
        )}

        <Pagination hasMore={hasMore} onLoadMore={handleLoadMore} loading={loading && results.length > 0} />
      </div>
    </AppLayout>
  );
}

export default function ForumSearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading search...</div>}>
      <ForumSearchContent />
    </Suspense>
  );
}
