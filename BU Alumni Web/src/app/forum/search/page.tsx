'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { ForumThread, Profile } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Search, MessageSquare, Eye } from 'lucide-react';

type ThreadWithAuthor = ForumThread & { author: Profile | null };

function ForumSearchContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ThreadWithAuthor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) return;
      setLoading(true);
      setSearched(true);

      const { data } = await supabase
        .from('forum_threads')
        .select('*, author:profiles(*), category:forum_categories(*)')
        .textSearch('search_vector', searchQuery, {
          type: 'websearch',
          config: 'english',
        });

      setResults((data || []) as ThreadWithAuthor[]);
      setLoading(false);
    },
    [supabase]
  );

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    window.history.replaceState({}, '', url);
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

        {loading ? (
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
              <Link key={thread.id} href={`/forum/${thread.category?.slug}/${thread.slug}`}>
                <Card className="hover:shadow-md transition-shadow border-mist">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={thread.author?.avatar_url || ''} alt={thread.author?.full_name || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {thread.author?.full_name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-forest truncate">{thread.title}</h3>
                        <p className="text-sm text-slate mt-0.5">
                          {thread.author?.full_name || 'Unknown'} · {thread.category?.name} ·{' '}
                          {formatDistanceToNow(new Date(thread.created_at))} ago
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 text-xs text-slate">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {thread.reply_count || 0}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate">
                            <Eye className="h-3.5 w-3.5" />
                            {thread.view_count || 0}
                          </span>
                          {thread.tags?.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
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
