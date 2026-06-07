'use client';

import Link from 'next/link';
import { ArrowBigUp, ArrowBigDown, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ForumThread, ForumCategory } from '@/lib/types';

interface ThreadCardProps {
  thread: ForumThread;
  category?: ForumCategory | null;
  categorySlug?: string;
  userVote?: 'up' | 'down' | null;
  onVote?: (threadId: string, voteType: 'up' | 'down') => void;
  index?: number;
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const intervals: [number, string][] = [
    [31536000, 'y'],
    [2592000, 'mo'],
    [86400, 'd'],
    [3600, 'h'],
    [60, 'm'],
  ];
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count}${label}`;
  }
  return 'now';
}

function getInitials(name?: string | null) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function ThreadCard({
  thread,
  category,
  categorySlug,
  userVote,
  onVote,
  index = 0,
}: ThreadCardProps) {
  const catSlug = categorySlug || category?.slug || thread.category?.slug || 'general';
  const score = (thread.upvotes || 0) - (thread.downvotes || 0);
  const authorName = thread.author?.full_name || thread.author?.display_name || 'Anonymous';

  const handleVote = (e: React.MouseEvent, type: 'up' | 'down') => {
    e.preventDefault();
    e.stopPropagation();
    onVote?.(thread.id, type);
  };

  return (
    <div
      className="group relative animate-fade-up"
      style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[hsl(var(--mist))] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex gap-0 rounded-xl overflow-hidden bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-0.5">
        {/* Vote sidebar */}
        <div className="flex flex-col items-center gap-1 py-4 px-2 bg-[hsl(var(--parchment))] dark:bg-[hsl(var(--sidebar-accent))] min-w-[52px]">
          <button
            onClick={(e) => handleVote(e, 'up')}
            className={`p-1.5 rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center ${
              userVote === 'up'
                ? 'bg-[hsl(var(--jungle))] text-white shadow-sm'
                : 'text-[hsl(var(--slate))] hover:bg-[hsl(var(--muted))]'
            }`}
          >
            <ArrowBigUp className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <span
            className={`text-sm font-bold tabular-nums ${
              score > 0
                ? 'text-[hsl(var(--jungle))] dark:text-[hsl(var(--forest))]'
                : score < 0
                ? 'text-[hsl(var(--terracotta))]'
                : 'text-[hsl(var(--slate))]'
            }`}
          >
            {score}
          </span>
          <button
            onClick={(e) => handleVote(e, 'down')}
            className={`p-1.5 rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center ${
              userVote === 'down'
                ? 'bg-[hsl(var(--terracotta))] text-white shadow-sm'
                : 'text-[hsl(var(--slate))] hover:bg-[hsl(var(--muted))]'
            }`}
          >
            <ArrowBigDown className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <Link href={`/forum/${catSlug}/${thread.id}`} className="flex-1 min-w-0 p-4 block">
          {/* Author row */}
          <div className="flex items-center gap-2.5 mb-2.5">
            <Avatar className="h-7 w-7 ring-2 ring-[hsl(var(--parchment))] dark:ring-[hsl(var(--sidebar-accent))]">
              <AvatarImage src={thread.author?.avatar_url || ''} />
              <AvatarFallback className="text-[10px] font-semibold bg-[hsl(var(--jungle))] text-[hsl(var(--paper))]">
                {getInitials(authorName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold text-[hsl(var(--forest))] dark:text-[hsl(var(--forest))]">
              {authorName}
            </span>
            <span className="text-[hsl(var(--mist))]">·</span>
            <span className="text-xs text-[hsl(var(--slate))]">{timeAgo(thread.created_at)}</span>
            {category && (
              <>
                <span className="text-[hsl(var(--mist))]">·</span>
                <span className="text-xs font-medium text-[hsl(var(--terracotta))]">{category.name}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg leading-snug text-[hsl(var(--ink))] dark:text-[hsl(var(--ink))] mb-2 group-hover:text-[hsl(var(--jungle))] transition-colors duration-200">
            {thread.title}
          </h3>

          {/* Body preview */}
          {thread.body_plain && (
            <p className="text-sm text-[hsl(var(--slate))] leading-relaxed line-clamp-2 mb-3">
              {thread.body_plain.slice(0, 220)}
            </p>
          )}

          {/* Footer meta */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-[hsl(var(--slate))]">
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} />
              <span className="font-medium">{thread.reply_count || 0}</span>
              <span className="hidden sm:inline">comments</span>
            </span>
            <span className="text-xs text-[hsl(var(--slate))]">
              {(thread.view_count || 0).toLocaleString()} views
            </span>
            {thread.is_pinned && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--gold))] bg-[hsl(var(--gold-light))] dark:bg-[hsl(var(--gold))]/10 px-2 py-0.5 rounded-full">
                Pinned
              </span>
            )}
            {thread.is_solved && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--jungle))] bg-[hsl(var(--jungle))]/10 px-2 py-0.5 rounded-full">
                Solved
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}
