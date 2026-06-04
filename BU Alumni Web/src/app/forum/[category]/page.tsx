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
import { ArrowUpDown, PlusCircle, ArrowLeft, Hash } from 'lucide-react';
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
  const [filter, setFilter] = useState<'all' | 'popular' | 'unanswered' | 'my-posts'>('all');
  const [sort, setSort] = useState<'latest-reply' | 'newest' | 'most-views'>('latest-reply');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
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
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link
            href="/forum"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Forum
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
                <Hash className="h-3.5 w-3.5" />
                Category
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-display text-forest tracking-tight">
                {category?.name || 'Category'}
              </h1>
              <p className="text-muted-foreground mt-2 max-w-lg leading-relaxed">
                {category?.description}
              </p>
            </div>
            <Link href={`/forum/new?category=${categorySlug}`}>
              <Button className="bg-primary hover:bg-emerald text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02]">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Post
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6"
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
                    ? 'bg-primary hover:bg-emerald text-white shadow-md shadow-primary/15'
                    : 'border-mist/50 dark:border-sidebar-border/30 text-forest hover:border-primary/30 hover:text-primary bg-card'
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
            <SelectTrigger className="w-[180px] bg-card border-mist/50 dark:border-sidebar-border/30 focus:border-primary/30">
              <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
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
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-14 border-2 border-dashed border-mist/40 dark:border-sidebar-border/30 rounded-2xl bg-card"
          >
            <Hash className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">No threads found</p>
            <p className="text-xs text-muted-foreground mt-1">Be the first to start a discussion!</p>
          </motion.div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {threads.map((thread) => (
              <motion.div key={thread.id} variants={listItem}>
                <ThreadCard
                  thread={thread}
                  category={category}
                  categorySlug={categorySlug}
                  userVote={userVotes[thread.id]}
                  onVote={handleVote}
                />
              </motion.div>
            ))}
          </motion.div>
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
