'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
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
      const { data: thr, error } = await supabase
        .from('forum_threads')
        .select('*, author:profiles(*), category:forum_categories(id, slug, name)')
        .eq('id', threadId)
        .single();

      if (error || !thr) {
        console.warn('[ThreadDetail] Thread not found for id:', threadId, error);
        setLoading(false);
        return;
      }

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

  const handleDeleteReply = async (replyId: string) => {
    try {
      await softDeleteReply(replyId);
      setReplies((prev) => prev.map((r) => (r.id === replyId ? { ...r, is_deleted: true } : r)));
      setReplyCount((c) => Math.max(c - 1, 0));
      toast({ title: 'Reply deleted' });
    } catch {
      toast({ title: 'Failed to delete reply', variant: 'destructive' });
    }
  };

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

  const handleDeleteThread = async () => {
    if (!thread) return;
    try {
      await softDeleteThread(thread.id);
      toast({ title: 'Thread deleted', description: 'Redirecting to forum...' });
      window.location.href = `/forum/${categorySlug}`;
    } catch {
      toast({ title: 'Failed to delete thread', variant: 'destructive' });
    }
  };

  const topLevelReplies = replies.filter((r) => !r.parent_id);
  const childReplies = replies.filter((r) => r.parent_id);
  const isAuthor = userId === thread?.author_id;
  const isAdmin = userRole === 'admin' || userRole === 'moderator';

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4 max-w-4xl mx-auto pt-4">
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
        <div className="text-center py-12 text-muted-foreground max-w-4xl mx-auto">
          Thread not found.
        </div>
      </AppLayout>
    );
  }

  if (thread.is_deleted && !isAdmin) {
    return (
      <AppLayout>
        <div className="text-center py-12 text-muted-foreground max-w-4xl mx-auto">
          This thread has been removed.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="relative max-w-4xl mx-auto pt-4">
        <FloatingOrb className="w-[400px] h-[400px] bg-primary/10 -top-20 -right-20" delay={0} />
        <FloatingOrb className="w-[300px] h-[300px] bg-meadow/10 top-1/3 -left-20" delay={2} />

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Link
            href={`/forum/${categorySlug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {thread.category?.name}
          </Link>
        </motion.div>

        {/* Thread */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className={`rounded-2xl border-mist/50 dark:border-sidebar-border/30 shadow-sm overflow-hidden ${thread.is_deleted ? 'opacity-60 border-dashed' : 'bg-card'}`}>
            <div className="h-[3px] w-full bg-gradient-to-r from-primary/60 via-meadow/50 to-primary/20" />
            <div className="flex">
              {/* Vote column */}
              <div className="flex flex-col items-center gap-0.5 py-4 px-3 bg-muted/30 dark:bg-sidebar-border/10 min-w-[56px]">
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
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-xs bg-background border-mist/40 dark:border-sidebar-border/30">
                    {thread.category?.name}
                  </Badge>
                  {thread.is_pinned && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <Pin className="h-3 w-3" />
                      Pinned
                    </span>
                  )}
                  {thread.is_locked && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      <Lock className="h-3 w-3" />
                      Locked
                    </span>
                  )}
                  {thread.is_solved && (
                    <Badge className="bg-success/10 text-success border-success/20 text-xs">
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
                      className="w-full text-2xl font-display font-bold text-card-foreground bg-transparent border-b border-input focus:outline-none focus:border-primary pb-1"
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
                      <Button size="sm" onClick={handleEditThread} className="bg-primary hover:bg-emerald">
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl sm:text-3xl font-display font-bold text-card-foreground leading-tight">
                      {thread.title}
                    </h1>
                    <div className="mt-3">
                      <AuthorBlock
                        author={thread.author}
                        createdAt={thread.created_at}
                        updatedAt={thread.updated_at}
                      />
                    </div>
                    <div className="mt-5 text-[15px] leading-relaxed">
                      <RenderBody body={thread.body} />
                    </div>
                  </>
                )}

                {/* Action bar */}
                <div className="flex flex-wrap items-center gap-2 mt-7 pt-5 border-t border-mist/30">
                  <Button variant="ghost" size="sm" onClick={handleShare} className="text-muted-foreground hover:text-foreground">
                    <Share2 className="mr-1.5 h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleToggleBookmark} className="text-muted-foreground hover:text-primary">
                    {isBookmarked ? (
                      <BookmarkCheck className="mr-1.5 h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="mr-1.5 h-4 w-4" />
                    )}
                    {isBookmarked ? 'Saved' : 'Bookmark'}
                  </Button>
                  {(isAuthor || isAdmin) && !isEditingThread && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingThread(true)} className="text-muted-foreground hover:text-foreground">
                        <Pencil className="mr-1.5 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleDeleteThread}>
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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-8"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <MessageSquare className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-display font-bold text-forest">
              {replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}
            </h2>
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {topLevelReplies.map((reply) => (
              <motion.div key={reply.id} variants={listItem}>
                <ReplyCard
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
              </motion.div>
            ))}
          </motion.div>

          <Pagination hasMore={replies.length < replyCount} onLoadMore={handleLoadMore} loading={submittingReply} />
        </motion.div>

        {/* Reply form */}
        {!thread.is_locked && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mt-8"
          >
            <Card className="rounded-2xl border-mist/50 dark:border-sidebar-border/30 bg-card shadow-sm">
              <div className="h-[3px] w-full bg-gradient-to-r from-meadow/60 via-primary/50 to-meadow/30" />
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-sm font-semibold text-forest mb-4 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
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
            className="text-center py-8 text-muted-foreground border-2 border-dashed border-mist/40 dark:border-sidebar-border/30 rounded-2xl bg-card mt-8"
          >
            <Lock className="h-6 w-6 mx-auto mb-2 text-muted-foreground/40" />
            This thread is locked. New replies are not allowed.
          </motion.div>
        )}
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
