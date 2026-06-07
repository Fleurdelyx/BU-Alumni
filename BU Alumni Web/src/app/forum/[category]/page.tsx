'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThreadCard } from '@/components/forum/thread-card';
import { Pagination } from '@/components/forum/pagination';
import type { ForumCategory, ForumThread } from '@/lib/types';
import { ArrowUpDown, PlusCircle, ArrowLeft, Hash, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

/* ─── Floating Orb ─── */
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-10 pointer-events-none ${className}`}
      animate={{ y: [0, -25, 0], x: [0, 12, 0], scale: [1, 1.08, 1] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const listItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const THREADS_PER_PAGE = 20;

type ThreadWithAuthor = ForumThread & { author: { full_name: string; avatar_url: string | null } | null };

function CategoryContent() {
  const params = useParams();
  const supabase = createClient();
  const categorySlug = params.category as string;

  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [threads, setThreads] = useState<ThreadWithAuthor[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('alumni');
  const [filter, setFilter] = useState<'all' | 'popular' | 'unanswered' | 'my-posts'>('all');
  const [sort, setSort] = useState<'latest-reply' | 'newest' | 'most-views'>('latest-reply');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setUserId(user?.id || null);
      if (user) {
        supabase.from('profiles').select('role').eq('id', user.id).single().then(({ data }) => {
          setUserRole(data?.role || 'alumni');
        });
      }
    });
  }, [supabase]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setPage(0);
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
      await loadThreads(cat.id, 0);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, categorySlug, filter, sort, userId]);

  async function loadThreads(categoryId: string, pageNum: number) {
    let query = supabase
      .from('forum_threads')
      .select('*', { count: 'exact' })
      .eq('category_id', categoryId)
      .eq('is_deleted', false);

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

    const start = pageNum * THREADS_PER_PAGE;
    const end = start + THREADS_PER_PAGE - 1;
    query = query.range(start, end);

    const { data: thr, error: queryError, count } = await query;
    if (queryError) {
      console.error('Category threads query error:', queryError);
    }

    let filtered = thr || [];
    if (filter === 'popular') {
      filtered = filtered.filter((t: ThreadWithAuthor) => (t.reply_count || 0) >= 5 || (t.view_count || 0) >= 50);
    }

    // Fetch author profiles separately
    const authorIds = [...new Set(filtered.map((t) => t.author_id))];
    let authorMap: Record<string, { full_name: string; avatar_url: string | null }> = {};
    if (authorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', authorIds);
      (profiles || []).forEach((p) => {
        authorMap[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
      });
    }

    const threadsWithAuthor = filtered.map((t) => ({
      ...t,
      author: authorMap[t.author_id] || null,
    })) as ThreadWithAuthor[];

    const threadIds = threadsWithAuthor.map((t) => t.id);

    // Fetch user votes
    let voteMap: Record<string, 'up' | 'down'> = {};
    if (userId && threadIds.length > 0) {
      const { data: votes } = await supabase
        .from('forum_votes')
        .select('target_id, vote_type')
        .eq('target_type', 'thread')
        .eq('user_id', userId)
        .in('target_id', threadIds);
      (votes || []).forEach((v) => {
        voteMap[v.target_id] = v.vote_type as 'up' | 'down';
      });
    }

    if (pageNum === 0) {
      setThreads(threadsWithAuthor);
      setUserVotes(voteMap);
    } else {
      setThreads((prev) => [...prev, ...threadsWithAuthor]);
      setUserVotes((prev) => ({ ...prev, ...voteMap }));
    }
    setHasMore((count || threadsWithAuthor.length) > THREADS_PER_PAGE);
    setLoading(false);
  }

  const handleVote = async (threadId: string, voteType: 'up' | 'down') => {
    if (!userId) return;
    const { data, error } = await supabase.rpc('apply_vote', {
      p_user_id: userId,
      p_target_type: 'thread',
      p_target_id: threadId,
      p_vote_type: voteType,
    });
    if (error) {
      console.error('Vote error:', error);
      return;
    }
    const result = data as any;
    if (result?.success) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? {
                ...t,
                upvotes: (t.upvotes || 0) + (result.up_delta || 0),
                downvotes: (t.downvotes || 0) + (result.down_delta || 0),
              }
            : t
        )
      );
      setUserVotes((prev) => {
        const current = prev[threadId];
        if (current === voteType) {
          const { [threadId]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [threadId]: voteType };
      });
    }
  };

  const handleLoadMore = async () => {
    if (!category) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await loadThreads(category.id, nextPage);
  };

  return (
    <AppLayout>
      <div className="relative max-w-5xl mx-auto pt-4">
        {/* Background orbs */}
        <FloatingOrb className="w-[400px] h-[400px] bg-primary/15 -top-20 -right-20" delay={0} />
        <FloatingOrb className="w-[300px] h-[300px] bg-meadow/10 bottom-0 left-0" delay={2} />

        {/* Back + Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <Link
            href="/forum"
            className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--slate))] hover:text-[hsl(var(--forest))] transition-colors mb-5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Forum
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--jungle))]/8 text-[hsl(var(--jungle))] text-[10px] font-bold uppercase tracking-[0.15em] mb-4">
                <Hash className="h-3 w-3" />
                Category
              </div>
              <h1 className="text-4xl sm:text-5xl font-serif text-[hsl(var(--ink))] dark:text-[hsl(var(--ink))] leading-[1.1]">
                {category?.name || 'Category'}
              </h1>
              <p className="text-[hsl(var(--slate))] mt-3 max-w-lg leading-relaxed text-base">
                {category?.description}
              </p>
            </div>
            {categorySlug === 'announcements' && userRole !== 'admin' && userRole !== 'moderator' ? (
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--slate))] text-sm font-medium">
                <Lock className="h-4 w-4" />
                Staff Only
              </span>
            ) : (
              <Link href={`/forum/new?category=${categorySlug}`}>
                <Button className="bg-[hsl(var(--forest))] hover:bg-[hsl(var(--jungle))] text-[hsl(var(--paper))] shadow-warm-lg transition-all duration-300 hover:scale-[1.02] rounded-xl px-5">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Post
                </Button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-[hsl(var(--fog))]"
        >
          <div className="flex flex-wrap gap-2">
            {(['all', 'popular', 'unanswered', 'my-posts'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className={
                  filter === f
                    ? 'bg-[hsl(var(--forest))] hover:bg-[hsl(var(--jungle))] text-[hsl(var(--paper))] rounded-xl shadow-warm'
                    : 'border-[hsl(var(--fog))] text-[hsl(var(--charcoal))] hover:border-[hsl(var(--jungle))] hover:text-[hsl(var(--jungle))] bg-[hsl(var(--card))] rounded-xl'
                }
              >
                {f === 'all' && 'All'}
                {f === 'popular' && 'Popular'}
                {f === 'unanswered' && 'Unanswered'}
                {f === 'my-posts' && 'My Posts'}
              </Button>
            ))}
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="w-[180px] bg-[hsl(var(--card))] border-[hsl(var(--fog))] focus:border-[hsl(var(--jungle))] rounded-xl">
              <ArrowUpDown className="mr-2 h-4 w-4 text-[hsl(var(--slate))]" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest-reply">Latest Reply</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="most-views">Most Views</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Thread List */}
        {loading && threads.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 border-2 border-dashed border-[hsl(var(--fog))] rounded-2xl bg-[hsl(var(--card))]"
          >
            <Hash className="h-10 w-10 mx-auto text-[hsl(var(--mist))] mb-4" />
            <p className="text-[hsl(var(--charcoal))] font-medium">No threads found</p>
            <p className="text-sm text-[hsl(var(--slate))] mt-1">Be the first to start a discussion!</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread, i) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                category={category}
                categorySlug={categorySlug}
                userVote={userVotes[thread.id]}
                onVote={handleVote}
                index={i}
              />
            ))}
          </div>
        )}

        <Pagination hasMore={hasMore} onLoadMore={handleLoadMore} loading={loading && threads.length > 0} />
      </div>
    </AppLayout>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading forum...</div>}>
      <CategoryContent />
    </Suspense>
  );
}
