'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ForumCategory, ForumThread, Profile } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Eye, Pin, ArrowUpDown, PlusCircle } from 'lucide-react';

type ThreadWithAuthor = ForumThread & { author: Profile | null };

type ReactionAgg = {
  thread_id: string;
  emoji: string;
  count: number;
};

function CategoryContent() {
  const params = useParams();
  const supabase = createClient();
  const categorySlug = params.category as string;

  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [threads, setThreads] = useState<ThreadWithAuthor[]>([]);
  const [reactions, setReactions] = useState<ReactionAgg[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'popular' | 'unanswered' | 'my-posts'>('all');
  const [sort, setSort] = useState<'latest-reply' | 'newest' | 'most-views'>('latest-reply');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, [supabase]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: cat } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('slug', categorySlug)
        .single();

      if (!cat) {
        setLoading(false);
        return;
      }
      setCategory(cat);

      let query = supabase
        .from('forum_threads')
        .select('*, author:profiles(*)')
        .eq('category_id', cat.id);

      if (filter === 'unanswered') {
        query = query.eq('reply_count', 0);
      } else if (filter === 'my-posts' && userId) {
        query = query.eq('author_id', userId);
      }

      if (sort === 'latest-reply') {
        query = query
          .order('is_pinned', { ascending: false })
          .order('last_reply_at', { ascending: false, nullsFirst: false });
      } else if (sort === 'newest') {
        query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
      } else if (sort === 'most-views') {
        query = query.order('is_pinned', { ascending: false }).order('view_count', { ascending: false });
      }

      const { data: thr } = await query;

      let filtered = thr || [];
      if (filter === 'popular') {
        filtered = filtered.filter((t: ThreadWithAuthor) => (t.reply_count || 0) >= 5 || (t.view_count || 0) >= 50);
      }

      setThreads(filtered as ThreadWithAuthor[]);

      if (filtered.length > 0) {
        const threadIds = filtered.map((t) => t.id);
        const { data: reacs } = await supabase
          .from('forum_reactions')
          .select('thread_id, emoji')
          .in('thread_id', threadIds);

        const agg: Record<string, Record<string, number>> = {};
        (reacs || []).forEach((r) => {
          if (!agg[r.thread_id]) agg[r.thread_id] = {};
          agg[r.thread_id][r.emoji] = (agg[r.thread_id][r.emoji] || 0) + 1;
        });

        const aggList: ReactionAgg[] = [];
        Object.entries(agg).forEach(([tid, emojis]) => {
          Object.entries(emojis).forEach(([emoji, count]) => {
            aggList.push({ thread_id: tid, emoji, count });
          });
        });
        setReactions(aggList);
      } else {
        setReactions([]);
      }

      setLoading(false);
    }

    load();
  }, [supabase, categorySlug, filter, sort, userId]);

  const getReactionsForThread = (threadId: string) => {
    return reactions.filter((r) => r.thread_id === threadId);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display">{category?.name || 'Category'}</h1>
            <p className="text-slate mt-1">{category?.description}</p>
          </div>
          <Link href={`/forum/new?category=${categorySlug}`}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(['all', 'popular', 'unanswered', 'my-posts'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === 'all' && 'All'}
                {f === 'popular' && 'Popular'}
                {f === 'unanswered' && 'Unanswered'}
                {f === 'my-posts' && 'My Posts'}
              </Button>
            ))}
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="w-[180px]">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest-reply">Latest Reply</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="most-views">Most Views</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg text-slate">
            No threads found. Be the first to start a discussion!
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map((thread) => {
              const threadReactions = getReactionsForThread(thread.id);
              return (
                <Link key={thread.id} href={`/forum/${categorySlug}/${thread.slug}`}>
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
                          <div className="flex items-center gap-2">
                            {thread.is_pinned && <Pin className="h-4 w-4 text-primary shrink-0" />}
                            <h3 className="font-display font-semibold text-forest truncate">{thread.title}</h3>
                          </div>
                          <p className="text-sm text-slate mt-0.5">
                            {thread.author?.full_name || 'Unknown'} ·{' '}
                            {thread.last_reply_at
                              ? `${formatDistanceToNow(new Date(thread.last_reply_at))} ago`
                              : `${formatDistanceToNow(new Date(thread.created_at))} ago`}
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
                            {threadReactions.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                {threadReactions.slice(0, 3).map((r, idx) => (
                                  <span
                                    key={idx}
                                    className="flex items-center gap-0.5 text-xs text-slate bg-fog px-1.5 py-0.5 rounded"
                                  >
                                    <span>{r.emoji}</span>
                                    <span>{r.count}</span>
                                  </span>
                                ))}
                                {threadReactions.length > 3 && (
                                  <span className="text-xs text-slate">+{threadReactions.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading forum...</div>}>
      <CategoryContent />
    </Suspense>
  );
}
