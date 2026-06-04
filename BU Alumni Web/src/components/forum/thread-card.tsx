'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ForumThread, ForumCategory } from '@/lib/types';

interface ThreadCardProps {
  thread: ForumThread;
  category?: ForumCategory | null;
  categorySlug?: string;
  userVote?: 'up' | 'down' | null;
  onVote?: (threadId: string, voteType: 'up' | 'down') => void;
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
    if (count >= 1) return `${count}${label} ago`;
  }
  return 'just now';
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
    <Card className="border-mist/50 dark:border-sidebar-border/30 hover:border-primary/30 transition-colors">
      <CardContent className="p-0 flex">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-0.5 py-3 px-2 bg-muted/30 dark:bg-sidebar-border/10 rounded-l-lg min-w-[48px]">
          <button
            onClick={(e) => handleVote(e, 'up')}
            className={`p-0.5 rounded hover:bg-muted transition-colors ${
              userVote === 'up' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <ArrowBigUp className="w-6 h-6" />
          </button>
          <span className={`text-sm font-bold ${score > 0 ? 'text-primary' : score < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {score}
          </span>
          <button
            onClick={(e) => handleVote(e, 'down')}
            className={`p-0.5 rounded hover:bg-muted transition-colors ${
              userVote === 'down' ? 'text-destructive' : 'text-muted-foreground'
            }`}
          >
            <ArrowBigDown className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <Link href={`/forum/${catSlug}/${thread.id}`} className="flex-1 min-w-0 p-3 block">
          <div className="flex items-center gap-2 mb-1">
            <Avatar className="h-5 w-5">
              <AvatarImage src={thread.author?.avatar_url || ''} />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                {getInitials(authorName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-primary">{authorName}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{timeAgo(thread.created_at)}</span>
            {category && (
              <>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{category.name}</span>
              </>
            )}
          </div>

          <h3 className="font-semibold text-card-foreground leading-snug mb-1 group-hover:text-primary transition-colors">
            {thread.title}
          </h3>

          {thread.body_plain && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {thread.body_plain.slice(0, 200)}
            </p>
          )}

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              {thread.reply_count || 0} comments
            </span>
            <span className="text-xs text-muted-foreground">
              {(thread.view_count || 0).toLocaleString()} views
            </span>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
