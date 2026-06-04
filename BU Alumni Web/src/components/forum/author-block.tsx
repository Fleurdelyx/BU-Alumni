'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import type { Profile } from '@/lib/types';

interface AuthorBlockProps {
  author: Profile | null | undefined;
  createdAt: string;
  updatedAt?: string;
  editCount?: number;
  size?: 'sm' | 'md';
  showTime?: boolean;
  meta?: React.ReactNode;
}

export function AuthorBlock({
  author,
  createdAt,
  updatedAt,
  editCount,
  size = 'md',
  showTime = true,
  meta,
}: AuthorBlockProps) {
  const isEdited = editCount ? editCount > 0 : updatedAt && new Date(updatedAt) > new Date(createdAt);

  return (
    <div className="flex items-center gap-3">
      <Avatar className={size === 'sm' ? 'h-7 w-7' : 'h-8 w-8'}>
        <AvatarImage src={author?.avatar_url || ''} alt={author?.full_name || ''} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {author?.full_name?.[0] || '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-medium ${size === 'sm' ? 'text-sm' : 'text-sm'}`}>
            {author?.full_name || 'Unknown'}
          </span>
          {showTime && (
            <span className="text-xs text-slate">
              {formatDistanceToNow(new Date(createdAt))} ago
              {isEdited && ' · edited'}
            </span>
          )}
          {meta}
        </div>
      </div>
    </div>
  );
}
