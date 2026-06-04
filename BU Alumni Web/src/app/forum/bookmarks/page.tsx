'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/app-layout';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { ForumThread, Profile } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Bookmark, MessageSquare, Eye } from 'lucide-react';

type ThreadWithAuthor = ForumThread & { author: Profile | null };

export default function BookmarksPage() {
  const supabase = createClient();
  const [threads, setThreads] = useState<ThreadWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserId(null);
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from('forum_bookmarks')
        .select('thread:forum_threads(*, author:profiles(*), category:forum_categories(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const flattened = (data || [])
        .map((d: any) => d.thread)
        .filter(Boolean) as ThreadWithAuthor[];

      setThreads(flattened);
      setLoading(false);
    }
    load();
  }, [supabase]);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold font-display">My Bookmarks</h1>
          <p className="text-slate mt-1">Threads you&apos;ve saved for later.</p>
        </div>

        {loading ? (
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
