'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import type { Profile } from '@/lib/types';

function getDisplayName(author?: Profile | null) {
  if (!author) return 'Anonymous';
  if (author.full_name?.trim()) return author.full_name.trim();
  if (author.display_name?.trim()) return author.display_name.trim();
  const parts = [author.first_name, author.last_name].filter(Boolean);
  if (parts.length > 0) return parts.join(' ');
  return 'Anonymous';
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

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
  const name = getDisplayName(author);

  return (
    <div className="flex items-center gap-2">
      <Avatar className={size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'}>
        <AvatarImage src={author?.avatar_url || ''} alt={name} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`font-semibold text-primary ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {name}
        </span>
        {showTime && (
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(createdAt))} ago
            {isEdited && ' · edited'}
          </span>
        )}
        {meta}
      </div>
    </div>
  );
}
