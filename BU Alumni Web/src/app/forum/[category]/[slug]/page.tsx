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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import type { ForumCategory, ForumThread, ForumReply, Profile } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  Eye,
  Share2,
  Bookmark,
  BookmarkCheck,
  Pin,
  Lock,
  CheckCircle2,
  Send,
  ArrowLeft,
} from 'lucide-react';

type ThreadWithRelations = ForumThread & {
  author: Profile | null;
  category: ForumCategory | null;
};

type ReplyWithAuthor = ForumReply & { author: Profile | null };

const REACTION_EMOJIS = ['👍', '❤️', '🎉', '💡', '🙏'];

function ThreadDetailContent() {
  const params = useParams();
  const supabase = createClient();
  const categorySlug = params.category as string;
  const threadSlug = params.slug as string;

  const [thread, setThread] = useState<ThreadWithRelations | null>(null);
  const [replies, setReplies] = useState<ReplyWithAuthor[]>([]);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, [supabase]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: thr } = await supabase
        .from('forum_threads')
        .select('*, author:profiles(*), category:forum_categories(*)')
        .eq('slug', threadSlug)
        .single();

      if (!thr) {
        setLoading(false);
        return;
      }
      setThread(thr as ThreadWithRelations);

      await supabase.rpc('increment_thread_view', { thread_id: thr.id });

      const { data: reps } = await supabase
        .from('forum_replies')
        .select('*, author:profiles(*)')
        .eq('thread_id', thr.id)
        .order('created_at', { ascending: true });

      setReplies((reps || []) as ReplyWithAuthor[]);

      const { data: reacs } = await supabase
        .from('forum_reactions')
        .select('emoji, user_id')
        .eq('thread_id', thr.id);

      const agg: Record<string, number> = {};
      let userReac: string | null = null;
      (reacs || []).forEach((r) => {
        agg[r.emoji] = (agg[r.emoji] || 0) + 1;
        if (r.user_id === userId) userReac = r.emoji;
      });
      setReactions(agg);
      setUserReaction(userReac);

      if (userId) {
        const { data: bm } = await supabase
          .from('forum_bookmarks')
          .select('id')
          .eq('thread_id', thr.id)
          .eq('user_id', userId)
          .maybeSingle();
        setIsBookmarked(!!bm);
      }

      setLoading(false);
    }
    load();
  }, [supabase, threadSlug, userId]);

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
          supabase
            .from('profiles')
            .select('*')
            .eq('id', newReply.author_id)
            .single()
            .then(({ data: author }) => {
              setReplies((prev) => [...prev, { ...newReply, author } as ReplyWithAuthor]);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, thread]);

  const toggleReaction = async (emoji: string) => {
    if (!userId || !thread) return;

    if (userReaction === emoji) {
      await supabase
        .from('forum_reactions')
        .delete()
        .eq('thread_id', thread.id)
        .eq('user_id', userId)
        .eq('emoji', emoji);
      setReactions((prev) => ({ ...prev, [emoji]: Math.max((prev[emoji] || 0) - 1, 0) }));
      setUserReaction(null);
    } else {
      if (userReaction) {
        await supabase
          .from('forum_reactions')
          .delete()
          .eq('thread_id', thread.id)
          .eq('user_id', userId);
        setReactions((prev) => ({
          ...prev,
          [userReaction]: Math.max((prev[userReaction] || 0) - 1, 0),
        }));
      }
      await supabase.from('forum_reactions').insert({
        thread_id: thread.id,
        user_id: userId,
        emoji,
      });
      setReactions((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
      setUserReaction(emoji);
    }
  };

  const toggleBookmark = async () => {
    if (!userId || !thread) return;
    if (isBookmarked) {
      await supabase.from('forum_bookmarks').delete().eq('thread_id', thread.id).eq('user_id', userId);
      setIsBookmarked(false);
    } else {
      await supabase.from('forum_bookmarks').insert({
        thread_id: thread.id,
        user_id: userId,
      });
      setIsBookmarked(true);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback silently
    }
  };

  const submitReply = async () => {
    if (!replyBody.trim() || !userId || !thread) return;
    setSubmitting(true);
    await supabase.from('forum_replies').insert({
      thread_id: thread.id,
      author_id: userId,
      body: replyBody.trim(),
      body_plain: replyBody.trim(),
    });
    setReplyBody('');
    setSubmitting(false);
  };

  const markAsAnswer = async (replyId: string) => {
    if (!thread || userId !== thread.author_id) return;
    await supabase.from('forum_replies').update({ is_accepted: false }).eq('thread_id', thread.id);
    await supabase.from('forum_replies').update({ is_accepted: true }).eq('id', replyId);
    setReplies((prev) => prev.map((r) => ({ ...r, is_accepted: r.id === replyId })));
  };

  const renderBody = (body: string) => {
    try {
      const json = JSON.parse(body);
      if (json && typeof json === 'object') {
        const extractText = (node: any): string => {
          if (!node) return '';
          if (node.text) return node.text;
          if (node.content) return node.content.map(extractText).join('');
          return '';
        };
        return <p className="whitespace-pre-wrap">{extractText(json)}</p>;
      }
    } catch {
      // Not JSON
    }
    if (body.trim().startsWith('<')) {
      return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: body }} />;
    }
    return <p className="whitespace-pre-wrap">{body}</p>;
  };

  const topLevelReplies = replies.filter((r) => !r.parent_id);
  const childReplies = replies.filter((r) => r.parent_id);

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4 max-w-4xl mx-auto">
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
      </AppLayout>
    );
  }

  if (!thread) {
    return (
      <AppLayout>
        <div className="text-center py-12 text-slate">Thread not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link href={`/forum/${categorySlug}`} className="inline-flex items-center text-sm text-slate hover:text-forest">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to {thread.category?.name}
        </Link>

        <Card className="border-mist">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs">
                {thread.category?.name}
              </Badge>
              {thread.is_pinned && <Pin className="h-4 w-4 text-primary" />}
              {thread.is_locked && <Lock className="h-4 w-4 text-slate" />}
              {thread.is_solved && (
                <Badge className="bg-success/10 text-success border-success/20">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Solved
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-display font-bold text-forest">{thread.title}</h1>
            <div className="flex items-center gap-3 mt-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={thread.author?.avatar_url || ''} alt={thread.author?.full_name || ''} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {thread.author?.full_name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{thread.author?.full_name || 'Unknown'}</p>
                <p className="text-xs text-slate">
                  {formatDistanceToNow(new Date(thread.created_at))} ago ·{' '}
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {thread.view_count || 0}
                  </span>
                </p>
              </div>
            </div>
            <div className="mt-4 text-foreground">{renderBody(thread.body)}</div>

            <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-mist">
              {REACTION_EMOJIS.map((emoji) => (
                <Button
                  key={emoji}
                  variant={userReaction === emoji ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 px-2 gap-1"
                  onClick={() => toggleReaction(emoji)}
                >
                  <span>{emoji}</span>
                  <span className="text-xs">{reactions[emoji] || 0}</span>
                </Button>
              ))}
              <div className="flex-1" />
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="mr-1 h-4 w-4" />
                Share
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleBookmark}>
                {isBookmarked ? (
                  <BookmarkCheck className="mr-1 h-4 w-4 text-primary" />
                ) : (
                  <Bookmark className="mr-1 h-4 w-4" />
                )}
                {isBookmarked ? 'Saved' : 'Bookmark'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-lg font-display font-semibold text-forest">
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </h2>

          {topLevelReplies.map((reply) => (
            <div key={reply.id}>
              <Card className={`border-mist ${reply.is_accepted ? 'border-success/50 bg-success/5' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={reply.author?.avatar_url || ''} alt={reply.author?.full_name || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {reply.author?.full_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{reply.author?.full_name || 'Unknown'}</span>
                        <span className="text-xs text-slate">
                          {formatDistanceToNow(new Date(reply.created_at))} ago
                        </span>
                        {reply.is_accepted && (
                          <Badge className="bg-success/10 text-success border-success/20 text-xs">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Answer
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-foreground">{renderBody(reply.body)}</div>
                      {userId === thread.author_id && !reply.is_accepted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-7 text-xs"
                          onClick={() => markAsAnswer(reply.id)}
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Mark as Answer
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              {childReplies
                .filter((c) => c.parent_id === reply.id)
                .map((child) => (
                  <Card key={child.id} className="border-mist ml-8 mt-2">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={child.author?.avatar_url || ''} alt={child.author?.full_name || ''} />
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                            {child.author?.full_name?.[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{child.author?.full_name || 'Unknown'}</span>
                            <span className="text-xs text-slate">
                              {formatDistanceToNow(new Date(child.created_at))} ago
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-foreground">{renderBody(child.body)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ))}
        </div>

        <Card className="border-mist">
          <CardContent className="p-5">
            <h3 className="text-sm font-medium mb-3">Post a reply</h3>
            <Textarea
              placeholder="Write your reply..."
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              rows={4}
              disabled={thread.is_locked}
            />
            <div className="flex justify-end mt-3">
              <Button onClick={submitReply} disabled={!replyBody.trim() || submitting || thread.is_locked}>
                <Send className="mr-2 h-4 w-4" />
                {submitting ? 'Posting...' : 'Post Reply'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default function ThreadDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading thread...</div>}>
      <ThreadDetailContent />
    </Suspense>
  );
}
