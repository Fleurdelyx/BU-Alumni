'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthorBlock } from '@/components/forum/author-block';
import { VoteBar } from '@/components/forum/vote-bar';
import { ReplyCard } from '@/components/forum/reply-card';
import { ReplyForm } from '@/components/forum/reply-form';
import { RenderBody } from '@/components/forum/render-body';
import { RichEditor } from '@/components/forum/rich-editor';
import { Pagination } from '@/components/forum/pagination';
import { useBookmark } from '@/hooks/forum/use-bookmark';
import { useReplyMutation } from '@/hooks/forum/use-reply-mutation';
import { useThreadMutation } from '@/hooks/forum/use-thread-mutation';
import type { ForumThread, ForumReply, Profile } from '@/lib/types';
import {
  Pin,
  Lock,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Share2,
  ArrowLeft,
  Pencil,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const REPLIES_PER_PAGE = 10;

type ThreadWithRelations = ForumThread & {
  author: Profile | null;
  category: { id: string; slug: string; name: string } | null;
};

type ReplyWithAuthor = ForumReply & { author: Profile | null };

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
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const listItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function ThreadDetailContent() {
  const params = useParams();
  const supabase = createClient();
  const { toast } = useToast();
  const categorySlug = params.category as string;
  const threadId = params.slug as string;

  const [thread, setThread] = useState<ThreadWithRelations | null>(null);
  const [replies, setReplies] = useState<ReplyWithAuthor[]>([]);
  const [replyCount, setReplyCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('alumni');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [threadUserVote, setThreadUserVote] = useState<'up' | 'down' | null>(null);
  const [replyUserVotes, setReplyUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [submittingReply, setSubmittingReply] = useState(false);
  const [isEditingThread, setIsEditingThread] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editBodyPlain, setEditBodyPlain] = useState('');
  const [deleteThreadDialogOpen, setDeleteThreadDialogOpen] = useState(false);
  const [deleteReplyId, setDeleteReplyId] = useState<string | null>(null);

  const { checkBookmarked, toggleBookmark } = useBookmark();
  const { createReply, updateReply, softDeleteReply, markAsAnswer, restoreReply } = useReplyMutation();
  const { updateThread, softDeleteThread, restoreThread } = useThreadMutation();

  // Auth
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

  // Load thread by ID
  useEffect(() => {
    async function load() {
      setLoading(true);
      console.log('[ThreadDetail] Loading thread. ID:', threadId, 'Category:', categorySlug);

      if (!threadId || threadId === 'undefined' || threadId === 'null') {
        console.error('[ThreadDetail] Invalid threadId:', threadId);
        setLoading(false);
        return;
      }

      // Try simple query first (no joins) to isolate RLS vs join issues
      const { data: simpleThr, error: simpleErr } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('id', threadId)
        .single();

      console.log('[ThreadDetail] Simple query result:', { simpleThr: !!simpleThr, simpleErrCode: (simpleErr as any)?.code, simpleErrMsg: (simpleErr as any)?.message });

      if (simpleErr || !simpleThr) {
        console.warn('[ThreadDetail] Simple query failed. ID:', threadId, 'Code:', (simpleErr as any)?.code, 'Msg:', (simpleErr as any)?.message);
        setLoading(false);
        return;
      }

      // Fetch author and category separately
      const [{ data: author }, { data: category }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', simpleThr.author_id).single(),
        supabase.from('forum_categories').select('id, slug, name').eq('id', simpleThr.category_id).single(),
      ]);

      const thr = { ...simpleThr, author: author || null, category: category || null };
      setThread(thr as ThreadWithRelations);
      setEditTitle(thr.title);
      setEditBody(thr.body);
      setReplyCount(thr.reply_count || 0);

      await supabase.rpc('increment_thread_view', { thread_id: thr.id });

      // Thread vote
      if (userId) {
        const { data: vote } = await supabase
          .from('forum_votes')
          .select('vote_type')
          .eq('target_type', 'thread')
          .eq('target_id', thr.id)
          .eq('user_id', userId)
          .single();
        setThreadUserVote(vote?.vote_type as 'up' | 'down' || null);
      }

      // Bookmark
      if (userId) {
        const bm = await checkBookmarked(thr.id, userId);
        setIsBookmarked(bm);
      }

      setLoading(false);
    }
    load();
  }, [supabase, threadId, userId]);

  // Load replies
  useEffect(() => {
    if (!thread) return;
    async function loadReplies() {
      const { data: reps } = await supabase
        .from('forum_replies')
        .select('*, author:profiles(*)')
        .eq('thread_id', thread!.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .range(0, REPLIES_PER_PAGE - 1);

      const loadedReplies = (reps || []) as ReplyWithAuthor[];
      setReplies(loadedReplies);

      // Load reply votes
      if (userId && loadedReplies.length > 0) {
        const replyIds = loadedReplies.map((r) => r.id);
        const { data: votes } = await supabase
          .from('forum_votes')
          .select('target_id, vote_type')
          .eq('target_type', 'reply')
          .eq('user_id', userId)
          .in('target_id', replyIds);
        const map: Record<string, 'up' | 'down'> = {};
        (votes || []).forEach((v) => { map[v.target_id] = v.vote_type as 'up' | 'down'; });
        setReplyUserVotes(map);
      }
    }
    loadReplies();
  }, [supabase, thread, userId]);

  // Realtime
  useEffect(() => {
    if (!thread) return;
    const channel = supabase
      .channel(`thread-${thread.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_replies',
          filter: `thread_id=eq.${thread.id}`,
        },
        (payload) => {
          const newReply = payload.new as ForumReply;
          if (newReply.is_deleted) return;
          supabase
            .from('profiles')
            .select('*')
            .eq('id', newReply.author_id)
            .single()
            .then(({ data: author }) => {
              setReplies((prev) => {
                if (prev.find((r) => r.id === newReply.id)) return prev;
                return [...prev, { ...newReply, author } as ReplyWithAuthor];
              });
              setReplyCount((c) => c + 1);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, thread]);

  const handleVote = async (targetType: 'thread' | 'reply', targetId: string, voteType: 'up' | 'down') => {
    if (!userId) {
      toast({ title: 'Please sign in to vote', variant: 'destructive' });
      return;
    }
    const { data, error } = await supabase.rpc('apply_vote', {
      p_user_id: userId,
      p_target_type: targetType,
      p_target_id: targetId,
      p_vote_type: voteType,
    });
    if (error) {
      console.error('Vote error:', error);
      return;
    }
    const result = data as any;
    if (!result?.success) return;

    const upDelta = result.up_delta || 0;
    const downDelta = result.down_delta || 0;

    if (targetType === 'thread' && thread) {
      setThread({
        ...thread,
        upvotes: (thread.upvotes || 0) + upDelta,
        downvotes: (thread.downvotes || 0) + downDelta,
      });
      setThreadUserVote((prev) => prev === voteType ? null : voteType);
    } else if (targetType === 'reply') {
      setReplies((prev) =>
        prev.map((r) =>
          r.id === targetId
            ? { ...r, upvotes: (r.upvotes || 0) + upDelta, downvotes: (r.downvotes || 0) + downDelta }
            : r
        )
      );
      setReplyUserVotes((prev) => {
        const current = prev[targetId];
        if (current === voteType) {
          const { [targetId]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [targetId]: voteType };
      });
    }
  };

  const handleLoadMore = async () => {
    if (!thread) return;
    const nextPage = page + 1;
    const { data: reps } = await supabase
      .from('forum_replies')
      .select('*, author:profiles(*)')
      .eq('thread_id', thread.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .range(nextPage * REPLIES_PER_PAGE, (nextPage + 1) * REPLIES_PER_PAGE - 1);

    const newReplies = (reps || []) as ReplyWithAuthor[];
    setReplies((prev) => [...prev, ...newReplies]);
    setPage(nextPage);

    if (userId && newReplies.length > 0) {
      const replyIds = newReplies.map((r) => r.id);
      const { data: votes } = await supabase
        .from('forum_votes')
        .select('target_id, vote_type')
        .eq('target_type', 'reply')
        .eq('user_id', userId)
        .in('target_id', replyIds);
      const map: Record<string, 'up' | 'down'> = {};
      (votes || []).forEach((v) => { map[v.target_id] = v.vote_type as 'up' | 'down'; });
      setReplyUserVotes((prev) => ({ ...prev, ...map }));
    }
  };

  const handleToggleBookmark = async () => {
    if (!userId || !thread) return;
    const next = await toggleBookmark(thread.id, userId, isBookmarked);
    setIsBookmarked(next);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied to clipboard' });
    } catch {
      toast({ title: 'Failed to copy link', variant: 'destructive' });
    }
  };

  const handleSubmitReply = async (body: string, plainText: string, parentId?: string | null) => {
    if (!userId || !thread) return;
    setSubmittingReply(true);
    try {
      const newReply = await createReply(thread.id, userId, body, plainText, parentId);
      setReplyUserVotes((prev) => ({ ...prev, [newReply.id]: 'up' }));
      if (!parentId) {
        setReplies((prev) => {
          if (prev.find((r) => r.id === newReply.id)) return prev;
          return [...prev, newReply as ReplyWithAuthor];
        });
        setReplyCount((c) => c + 1);
      } else {
        const { data: reps } = await supabase
          .from('forum_replies')
          .select('*, author:profiles(*)')
          .eq('thread_id', thread.id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true });
        setReplies((reps || []) as ReplyWithAuthor[]);
        setReplyCount((c) => c + 1);
      }
    } catch (err: any) {
      console.error('Failed to post reply:', err);
      toast({ title: 'Failed to post reply', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleEditReply = async (replyId: string, body: string, plainText: string) => {
    try {
      const updated = await updateReply(replyId, body, plainText);
      setReplies((prev) => prev.map((r) => (r.id === replyId ? (updated as ReplyWithAuthor) : r)));
    } catch {
      toast({ title: 'Failed to update reply', variant: 'destructive' });
    }
  };

  // handleDeleteReply replaced by dialog-based flow above

  const handleRestoreReply = async (replyId: string) => {
    try {
      await restoreReply(replyId);
      setReplies((prev) => prev.map((r) => (r.id === replyId ? { ...r, is_deleted: false } : r)));
      setReplyCount((c) => c + 1);
      toast({ title: 'Reply restored' });
    } catch {
      toast({ title: 'Failed to restore reply', variant: 'destructive' });
    }
  };

  const handleMarkAsAnswer = async (replyId: string) => {
    if (!thread) return;
    try {
      const updated = await markAsAnswer(replyId, thread.id);
      setReplies((prev) => prev.map((r) => ({ ...r, is_accepted: r.id === replyId })));
      setThread((prev) => (prev ? { ...prev, is_solved: true } : prev));
    } catch {
      toast({ title: 'Failed to mark as answer', variant: 'destructive' });
    }
  };

  const handleEditThread = async () => {
    if (!thread) return;
    try {
      const updated = await updateThread(thread.id, {
        title: editTitle.trim(),
        body: editBody.trim(),
        body_plain: editBodyPlain.trim(),
      });
      setThread(updated as ThreadWithRelations);
      setIsEditingThread(false);
      toast({ title: 'Thread updated' });
    } catch {
      toast({ title: 'Failed to update thread', variant: 'destructive' });
    }
  };

  const handleDeleteThread = () => {
    setDeleteThreadDialogOpen(true);
  };

  const confirmDeleteThread = async () => {
    if (!thread) return;
    try {
      await softDeleteThread(thread.id);
      setDeleteThreadDialogOpen(false);
      toast({ title: 'Thread deleted', description: 'Redirecting to forum...' });
      window.location.href = `/forum/${categorySlug}`;
    } catch {
      toast({ title: 'Failed to delete thread', variant: 'destructive' });
    }
  };

  const handleDeleteReply = (replyId: string) => {
    setDeleteReplyId(replyId);
  };

  const confirmDeleteReply = async () => {
    if (!deleteReplyId) return;
    try {
      await softDeleteReply(deleteReplyId);
      setReplies((prev) => prev.map((r) => (r.id === deleteReplyId ? { ...r, is_deleted: true } : r)));
      setReplyCount((c) => Math.max(c - 1, 0));
      setDeleteReplyId(null);
      toast({ title: 'Reply deleted' });
    } catch {
      toast({ title: 'Failed to delete reply', variant: 'destructive' });
    }
  };

  const topLevelReplies = replies.filter((r) => !r.parent_id);
  const childReplies = replies.filter((r) => r.parent_id);
  const isAuthor = userId === thread?.author_id;
  const isAdmin = userRole === 'admin' || userRole === 'moderator';

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4 max-w-4xl mx-auto pt-6">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  if (!thread) {
    return (
      <AppLayout>
        <div className="text-center py-20 max-w-4xl mx-auto">
          <p className="text-2xl font-serif text-[hsl(var(--ink))] mb-3">Thread not found.</p>
          <p className="text-sm font-mono bg-[hsl(var(--parchment))] px-4 py-1.5 rounded-lg inline-block text-[hsl(var(--slate))]">id: {threadId || 'undefined'}</p>
          <p className="text-sm text-[hsl(var(--slate))] mt-3">Open DevTools (F12) → Console for debug info.</p>
        </div>
      </AppLayout>
    );
  }

  if (thread.is_deleted && !isAdmin) {
    return (
      <AppLayout>
        <div className="text-center py-20 text-[hsl(var(--slate))] max-w-4xl mx-auto">
          This thread has been removed.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="relative max-w-4xl mx-auto pt-6 pb-12">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link
            href={`/forum/${categorySlug}`}
            className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--slate))] hover:text-[hsl(var(--forest))] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {thread.category?.name}
          </Link>
        </motion.div>

        {/* Thread */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className={`rounded-2xl border-[hsl(var(--border))] shadow-warm overflow-hidden ${thread.is_deleted ? 'opacity-60 border-dashed' : 'bg-[hsl(var(--card))]'}`}>
            <div className="h-1 w-full bg-gradient-to-r from-[hsl(var(--jungle))] via-[hsl(var(--bamboo))] to-[hsl(var(--terracotta))]" />
            <div className="flex">
              {/* Vote column */}
              <div className="flex flex-col items-center gap-0.5 py-5 px-3 bg-[hsl(var(--parchment))] dark:bg-[hsl(var(--sidebar-accent))] min-w-[56px]">
                <VoteBar
                  upvotes={thread.upvotes || 0}
                  downvotes={thread.downvotes || 0}
                  userVote={threadUserVote}
                  onVote={(type) => handleVote('thread', thread.id, type)}
                />
              </div>

              {/* Content */}
              <CardContent className="flex-1 p-6 sm:p-8">
                {/* Meta badges */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <Badge variant="outline" className="text-xs bg-[hsl(var(--paper))] border-[hsl(var(--fog))] text-[hsl(var(--slate))]">
                    {thread.category?.name}
                  </Badge>
                  {thread.is_pinned && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--gold))] bg-[hsl(var(--gold-light))] px-2 py-0.5 rounded-full">
                      <Pin className="h-3 w-3" />
                      Pinned
                    </span>
                  )}
                  {thread.is_locked && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--slate))] bg-[hsl(var(--muted))] px-2 py-0.5 rounded-full">
                      <Lock className="h-3 w-3" />
                      Locked
                    </span>
                  )}
                  {thread.is_solved && (
                    <Badge className="bg-[hsl(var(--jungle))]/10 text-[hsl(var(--jungle))] border-[hsl(var(--jungle))]/20 text-xs">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Solved
                    </Badge>
                  )}
                  {thread.is_deleted && (
                    <Badge variant="destructive" className="text-xs">Deleted</Badge>
                  )}
                </div>

                {isEditingThread ? (
                  <div className="space-y-3">
                    <input
                      className="w-full text-2xl font-serif font-bold text-[hsl(var(--ink))] bg-transparent border-b border-[hsl(var(--fog))] focus:outline-none focus:border-[hsl(var(--jungle))] pb-1"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <RichEditor
                      content={editBody}
                      onChange={(html, text) => {
                        setEditBody(html);
                        setEditBodyPlain(text);
                      }}
                      placeholder="Edit your thread..."
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsEditingThread(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleEditThread} className="bg-[hsl(var(--forest))] hover:bg-[hsl(var(--jungle))]">
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl sm:text-4xl font-serif text-[hsl(var(--ink))] dark:text-[hsl(var(--ink))] leading-[1.15]">
                      {thread.title}
                    </h1>
                    <div className="mt-4">
                      <AuthorBlock
                        author={thread.author}
                        createdAt={thread.created_at}
                        updatedAt={thread.updated_at}
                      />
                    </div>
                    <div className="mt-6 text-[15px] leading-[1.7] text-[hsl(var(--charcoal))] dark:text-[hsl(var(--charcoal))]">
                      <RenderBody body={thread.body} />
                    </div>
                  </>
                )}

                {/* Action bar */}
                <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-[hsl(var(--fog))]">
                  <Button variant="ghost" size="sm" onClick={handleShare} className="text-[hsl(var(--slate))] hover:text-[hsl(var(--forest))]">
                    <Share2 className="mr-1.5 h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleToggleBookmark} className="text-[hsl(var(--slate))] hover:text-[hsl(var(--jungle))]">
                    {isBookmarked ? (
                      <BookmarkCheck className="mr-1.5 h-4 w-4 text-[hsl(var(--jungle))]" />
                    ) : (
                      <Bookmark className="mr-1.5 h-4 w-4" />
                    )}
                    {isBookmarked ? 'Saved' : 'Bookmark'}
                  </Button>
                  {(isAuthor || isAdmin) && !isEditingThread && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingThread(true)} className="text-[hsl(var(--slate))] hover:text-[hsl(var(--forest))]">
                        <Pencil className="mr-1.5 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-[hsl(var(--terracotta))] hover:text-[hsl(var(--terracotta))]" onClick={handleDeleteThread}>
                        <Trash2 className="mr-1.5 h-4 w-4" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>

        {/* Replies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-10"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[hsl(var(--fog))]">
            <MessageSquare className="h-5 w-5 text-[hsl(var(--jungle))]" />
            <h2 className="text-xl font-serif text-[hsl(var(--ink))]">
              {replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}
            </h2>
          </div>

          <div className="space-y-4">
            {topLevelReplies.map((reply) => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                threadAuthorId={thread.author_id}
                userId={userId}
                userRole={userRole}
                userVote={replyUserVotes[reply.id]}
                onVote={(replyId, voteType) => handleVote('reply', replyId, voteType)}
                onMarkAsAnswer={handleMarkAsAnswer}
                onEdit={handleEditReply}
                onDelete={handleDeleteReply}
                onReply={(parentId, body, plainText) => handleSubmitReply(body, plainText, parentId)}
              >
                {childReplies
                  .filter((c) => c.parent_id === reply.id)
                  .map((child) => (
                    <div key={child.id} className="mt-3">
                      <ReplyCard
                        reply={child}
                        threadAuthorId={thread.author_id}
                        userId={userId}
                        userRole={userRole}
                        userVote={replyUserVotes[child.id]}
                        onVote={(replyId, voteType) => handleVote('reply', replyId, voteType)}
                        onMarkAsAnswer={handleMarkAsAnswer}
                        onEdit={handleEditReply}
                        onDelete={handleDeleteReply}
                        onReply={(parentId, body, plainText) => handleSubmitReply(body, plainText, parentId)}
                        depth={1}
                      />
                    </div>
                  ))}
              </ReplyCard>
            ))}
          </div>

          <Pagination hasMore={replies.length < replyCount} onLoadMore={handleLoadMore} loading={submittingReply} />
        </motion.div>

        {/* Reply form */}
        {!thread.is_locked && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-10"
          >
            <Card className="rounded-2xl border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-warm">
              <div className="h-1 w-full bg-gradient-to-r from-[hsl(var(--terracotta))] via-[hsl(var(--gold))] to-[hsl(var(--jungle))]" />
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--forest))] mb-5 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[hsl(var(--jungle))]" />
                  Post a reply
                </h3>
                <ReplyForm
                  onSubmit={(body, plainText) => handleSubmitReply(body, plainText)}
                  disabled={thread.is_locked}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {thread.is_locked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10 text-[hsl(var(--slate))] border-2 border-dashed border-[hsl(var(--fog))] rounded-2xl bg-[hsl(var(--card))] mt-10"
          >
            <Lock className="h-6 w-6 mx-auto mb-2 text-[hsl(var(--mist))]" />
            This thread is locked. New replies are not allowed.
          </motion.div>
        )}

        {/* Delete Thread Confirmation */}
        <AlertDialog open={deleteThreadDialogOpen} onOpenChange={setDeleteThreadDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this post?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The post will be marked as deleted and hidden from most users.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteThread} className="bg-[hsl(var(--terracotta))] hover:bg-[hsl(var(--terracotta))]/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Reply Confirmation */}
        <AlertDialog open={!!deleteReplyId} onOpenChange={(open) => !open && setDeleteReplyId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The comment will be marked as deleted and hidden from most users.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteReplyId(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteReply} className="bg-[hsl(var(--terracotta))] hover:bg-[hsl(var(--terracotta))]/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}

export default function ThreadDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading thread...</div>}>
      <ThreadDetailContent />
    </Suspense>
  );
}
