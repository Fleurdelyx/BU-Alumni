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
import { Search, Compass, MessageSquarePlus, Megaphone, Lock } from 'lucide-react';

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-[0.07] pointer-events-none ${className}`}
      animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
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

  const announcementCats = categories.filter((c) => c.slug === 'announcements');
  const regularCats = categories.filter((c) => c.slug !== 'announcements');

  return (
    <AppLayout>
      <div className="relative max-w-6xl mx-auto pt-6 pb-16">
        {/* Background orbs */}
        <FloatingOrb className="w-[500px] h-[500px] bg-[hsl(var(--jungle))] -top-20 -right-20" delay={0} />
        <FloatingOrb className="w-[400px] h-[400px] bg-[hsl(var(--terracotta))] top-1/3 -left-20" delay={2} />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--jungle))]/8 text-[hsl(var(--jungle))] text-[10px] font-bold uppercase tracking-[0.15em] mb-4">
                <Compass className="h-3 w-3" />
                Community
              </div>
              <h1 className="text-5xl sm:text-6xl font-serif text-[hsl(var(--ink))] leading-[1.05]">
                Forum
              </h1>
              <p className="text-[hsl(var(--slate))] mt-3 max-w-lg leading-relaxed text-base">
                Connect, share, and discuss with fellow alumni. Browse categories or jump into active conversations.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/forum/search"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--fog))] text-sm font-medium text-[hsl(var(--charcoal))] hover:border-[hsl(var(--jungle))] hover:text-[hsl(var(--jungle))] transition-all duration-200 shadow-warm"
              >
                <Search className="h-4 w-4" />
                Search
              </Link>
              <Link
                href="/forum/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--forest))] hover:bg-[hsl(var(--jungle))] text-[hsl(var(--paper))] text-sm font-medium shadow-warm-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <MessageSquarePlus className="h-4 w-4" />
                New Post
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Announcements Section */}
        {announcementCats.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="h-4 w-4 text-[hsl(var(--terracotta))]" />
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[hsl(var(--terracotta))]">Announcements</h2>
              <span className="text-[10px] font-medium text-[hsl(var(--slate))] bg-[hsl(var(--parchment))] px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Staff Only
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {announcementCats.map((category) => {
                const Icon = getForumIcon(category.icon);
                const stats = getCategoryStats(category.id);
                return (
                  <Link key={category.id} href={`/forum/${category.slug}`}>
                    <motion.div
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="relative overflow-hidden rounded-2xl border border-[hsl(var(--terracotta))]/20 shadow-warm hover:shadow-warm-lg transition-all duration-500 cursor-pointer group bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--terracotta-light))]/30"
                    >
                      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[hsl(var(--terracotta))] to-[hsl(var(--gold))]" />
                      <div className="relative p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className="h-10 w-10 rounded-xl flex items-center justify-center shadow-inner ring-1 ring-black/5"
                            style={{
                              backgroundColor: `${category.color || '#c45c3e'}15`,
                              color: category.color || '#c45c3e',
                            }}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-[hsl(var(--terracotta))]/10 text-[hsl(var(--terracotta))] font-medium border-0 text-xs"
                          >
                            {stats.count} {stats.count === 1 ? 'thread' : 'threads'}
                          </Badge>
                        </div>
                        <h3 className="font-serif text-lg text-[hsl(var(--ink))] group-hover:text-[hsl(var(--terracotta))] transition-colors duration-300">
                          {category.name}
                        </h3>
                        <p className="text-sm text-[hsl(var(--slate))] line-clamp-2 mt-1.5 leading-relaxed">
                          {category.description}
                        </p>
                        {stats.lastActivity && (
                          <div className="mt-4 pt-3 border-t border-[hsl(var(--fog))] flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--terracotta))] animate-pulse" />
                            <p className="text-xs text-[hsl(var(--slate))]">
                              Last activity <span className="font-medium text-[hsl(var(--terracotta))]">{formatDistanceToNow(new Date(stats.lastActivity))} ago</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Regular Categories */}
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {regularCats.map((category) => {
              const Icon = getForumIcon(category.icon);
              const stats = getCategoryStats(category.id);
              return (
                <motion.div key={category.id} variants={cardItem}>
                  <Link href={`/forum/${category.slug}`}>
                    <motion.div
                      whileHover={{ y: -6, transition: { duration: 0.25 } }}
                      className="relative overflow-hidden h-full rounded-2xl border border-[hsl(var(--fog))] shadow-warm hover:shadow-warm-lg transition-all duration-500 cursor-pointer group bg-[hsl(var(--card))]"
                    >
                      {/* Top accent bar */}
                      <div
                        className="absolute top-0 left-0 right-0 h-[3px] opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(90deg, ${category.color || '#2d6a3e'}, ${category.color || '#2d6a3e'}00)`,
                        }}
                      />

                      {/* Hover glow */}
                      <div
                        className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-15 transition-opacity duration-500 blur-3xl"
                        style={{ background: category.color || '#2d6a3e' }}
                      />

                      <div className="relative p-6">
                        <div className="flex items-start justify-between mb-5">
                          <motion.div
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            className="h-12 w-12 rounded-xl flex items-center justify-center shadow-inner ring-1 ring-black/5 transition-transform duration-300"
                            style={{
                              backgroundColor: category.color ? `${category.color}15` : '#E8F0E8',
                              color: category.color || '#2d6a3e',
                            }}
                          >
                            <Icon className="h-6 w-6" />
                          </motion.div>
                          <Badge
                            variant="secondary"
                            className="bg-[hsl(var(--parchment))] text-[hsl(var(--forest))] font-medium border-0 text-xs"
                          >
                            {stats.count} {stats.count === 1 ? 'thread' : 'threads'}
                          </Badge>
                        </div>

                        <h3 className="font-serif text-xl text-[hsl(var(--ink))] group-hover:text-[hsl(var(--jungle))] transition-colors duration-300">
                          {category.name}
                        </h3>
                        <p className="text-sm text-[hsl(var(--slate))] line-clamp-2 mt-2 leading-relaxed">
                          {category.description}
                        </p>

                        {stats.lastActivity && (
                          <div className="mt-5 pt-4 border-t border-[hsl(var(--fog))] flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--jungle))] animate-pulse" />
                            <p className="text-xs text-[hsl(var(--slate))]">
                              Last activity <span className="font-medium text-[hsl(var(--forest))]">{formatDistanceToNow(new Date(stats.lastActivity))} ago</span>
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
