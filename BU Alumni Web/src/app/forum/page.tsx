'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/app-layout';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getForumIcon } from '@/lib/forum-icons';
import type { ForumCategory, ForumThread } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export default function ForumPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: thr }] = await Promise.all([
        supabase.from('forum_categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('forum_threads').select('category_id, last_reply_at, reply_count'),
      ]);
      setCategories(cats || []);
      setThreads(thr || []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const getCategoryStats = (categoryId: string) => {
    const catThreads = threads.filter((t) => t.category_id === categoryId);
    const count = catThreads.length;
    const lastActivity = catThreads
      .filter((t) => t.last_reply_at)
      .sort((a, b) => new Date(b.last_reply_at!).getTime() - new Date(a.last_reply_at!).getTime())[0]?.last_reply_at;
    return { count, lastActivity };
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Community Forum</h1>
          <p className="text-slate mt-1">Connect, share, and discuss with fellow alumni.</p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = getForumIcon(category.icon);
              const stats = getCategoryStats(category.id);
              return (
                <Link key={category.id} href={`/forum/${category.slug}`}>
                  <Card className="h-full hover:shadow-md transition-shadow border-mist">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: category.color ? `${category.color}20` : '#E0F2E7',
                            color: category.color || '#4C992D',
                          }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <Badge variant="secondary" className="bg-mint text-forest">
                          {stats.count} {stats.count === 1 ? 'thread' : 'threads'}
                        </Badge>
                      </div>
                      <h3 className="mt-3 font-display font-semibold text-lg text-forest">{category.name}</h3>
                      <p className="text-sm text-slate line-clamp-2 mt-1">{category.description}</p>
                      {stats.lastActivity && (
                        <p className="text-xs text-slate mt-3">
                          Last activity {formatDistanceToNow(new Date(stats.lastActivity))} ago
                        </p>
                      )}
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
