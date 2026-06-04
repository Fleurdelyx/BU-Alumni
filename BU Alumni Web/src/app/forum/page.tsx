'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/app-layout';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getForumIcon } from '@/lib/forum-icons';
import type { ForumCategory, ForumThread } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Search, Compass, MessageSquarePlus } from 'lucide-react';

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
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ForumPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: thr }] = await Promise.all([
        supabase.from('forum_categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('forum_threads').select('category_id, last_reply_at, reply_count').eq('is_deleted', false),
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
      <div className="relative max-w-6xl mx-auto pt-4">
        {/* Background orbs */}
        <FloatingOrb className="w-[500px] h-[500px] bg-primary/20 -top-20 -right-20" delay={0} />
        <FloatingOrb className="w-[400px] h-[400px] bg-meadow/15 top-1/3 -left-20" delay={2} />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
                <Compass className="h-3.5 w-3.5" />
                Community
              </div>
              <h1 className="text-4xl font-bold font-display text-forest tracking-tight">
                Forum
              </h1>
              <p className="text-muted-foreground mt-2 max-w-lg leading-relaxed">
                Connect, share, and discuss with fellow alumni. Browse categories or jump into active conversations.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/forum/search"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-mist/40 dark:border-sidebar-border/30 text-sm font-medium text-forest hover:border-primary/30 hover:text-primary transition-all duration-200 shadow-sm"
              >
                <Search className="h-4 w-4" />
                Search
              </Link>
              <Link
                href="/forum/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-emerald text-white text-sm font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02]"
              >
                <MessageSquarePlus className="h-4 w-4" />
                New Post
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Category Grid */}
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {categories.map((category) => {
              const Icon = getForumIcon(category.icon);
              const stats = getCategoryStats(category.id);
              return (
                <motion.div key={category.id} variants={cardItem}>
                  <Link href={`/forum/${category.slug}`}>
                    <motion.div
                      whileHover={{ y: -8, transition: { duration: 0.25 } }}
                      className="relative overflow-hidden h-full rounded-2xl border border-mist/40 dark:border-sidebar-border/30 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer group bg-card"
                    >
                      {/* Top accent bar */}
                      <div
                        className="absolute top-0 left-0 right-0 h-[4px] opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(90deg, ${category.color || '#4C992D'}, ${category.color || '#4C992D'}66)`,
                        }}
                      />

                      {/* Hover glow */}
                      <div
                        className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-3xl"
                        style={{ background: category.color || '#4C992D' }}
                      />

                      <div className="relative p-6">
                        <div className="flex items-start justify-between mb-4">
                          <motion.div
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            className="h-12 w-12 rounded-xl flex items-center justify-center shadow-inner ring-1 ring-black/5 transition-transform duration-300"
                            style={{
                              backgroundColor: category.color ? `${category.color}18` : '#E0F2E7',
                              color: category.color || '#4C992D',
                            }}
                          >
                            <Icon className="h-6 w-6" />
                          </motion.div>
                          <Badge
                            variant="secondary"
                            className="bg-mint/50 text-forest font-medium border-0"
                          >
                            {stats.count} {stats.count === 1 ? 'thread' : 'threads'}
                          </Badge>
                        </div>

                        <h3 className="font-display font-bold text-xl text-card-foreground group-hover:text-primary transition-colors duration-300">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                          {category.description}
                        </p>

                        {stats.lastActivity && (
                          <div className="mt-4 pt-4 border-t border-mist/30 flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            <p className="text-xs text-muted-foreground">
                              Last activity <span className="font-medium text-forest">{formatDistanceToNow(new Date(stats.lastActivity))} ago</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
