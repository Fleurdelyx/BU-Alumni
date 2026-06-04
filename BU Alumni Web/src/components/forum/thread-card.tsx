'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Pin, MessageSquare, Eye } from 'lucide-react';
import { AuthorBlock } from './author-block';
import { TagList } from './tag-list';
import type { ForumThread, ForumCategory } from '@/lib/types';

interface ThreadCardProps {
  thread: ForumThread;
  category?: ForumCategory | null;
  categorySlug?: string;
  reactions?: { emoji: string; count: number }[];
  showCategory?: boolean;
}

export function ThreadCard({
  thread,
  category,
  categorySlug,
  reactions = [],
  showCategory = false,
}: ThreadCardProps) {
  const catSlug = categorySlug || category?.slug || thread.category?.slug || 'general';
  const threadSlug = thread.slug || thread.id;

  return (
    <Link href={`/forum/${catSlug}/${threadSlug}`}>
      <Card className="relative overflow-hidden border-mist/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group">
        {/* Left accent */}
        <div
          className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full transition-colors ${
            thread.is_pinned
              ? 'bg-primary'
              : thread.is_solved
              ? 'bg-green-500'
              : 'bg-mist/40 group-hover:bg-primary/40'
          }`}
        />
        <CardContent className="p-4 pl-5">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {thread.is_pinned && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </span>
                )}
                {thread.is_solved && (
                  <span className="text-xs font-semibold bg-green-50 text-green-700 px-1.5 py-0.5 rounded shrink-0 border border-green-200">
                    Solved
                  </span>
                )}
                <h3 className="font-display font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">
                  {thread.title}
                </h3>
              </div>

              <AuthorBlock
                author={thread.author}
                createdAt={thread.last_reply_at || thread.created_at}
                size="sm"
                showTime
                meta={
                  showCategory && category ? (
                    <span className="text-xs text-muted-foreground">in {category.name}</span>
                  ) : null
                }
              />

              <TagList tags={thread.tags || []} className="mt-2" />

              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1 text-xs text-slate">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {thread.reply_count || 0}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate">
                  <Eye className="h-3.5 w-3.5" />
                  {thread.view_count || 0}
                </span>
                {reactions.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {reactions.slice(0, 3).map((r, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-0.5 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded shadow-sm"
                      >
                        <span>{r.emoji}</span>
                        <span>{r.count}</span>
                      </span>
                    ))}
                    {reactions.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{reactions.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
