'use client';

import { ArrowBigUp, ArrowBigDown } from 'lucide-react';

interface VoteBarProps {
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  onVote?: (type: 'up' | 'down') => void;
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md';
}

export function VoteBar({
  upvotes,
  downvotes,
  userVote,
  onVote,
  orientation = 'vertical',
  size = 'md',
}: VoteBarProps) {
  const score = (upvotes || 0) - (downvotes || 0);
  const iconSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
  const scoreClass = size === 'sm' ? 'text-xs' : 'text-sm';

  const handleClick = (e: React.MouseEvent, type: 'up' | 'down') => {
    e.preventDefault();
    e.stopPropagation();
    onVote?.(type);
  };

  if (orientation === 'horizontal') {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => handleClick(e, 'up')}
          className={`p-0.5 rounded hover:bg-muted transition-colors ${
            userVote === 'up' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <ArrowBigUp className={iconSize} />
        </button>
        <span
          className={`${scoreClass} font-bold min-w-[1.5rem] text-center ${
            score > 0 ? 'text-primary' : score < 0 ? 'text-destructive' : 'text-muted-foreground'
          }`}
        >
          {score}
        </span>
        <button
          onClick={(e) => handleClick(e, 'down')}
          className={`p-0.5 rounded hover:bg-muted transition-colors ${
            userVote === 'down' ? 'text-destructive' : 'text-muted-foreground'
          }`}
        >
          <ArrowBigDown className={iconSize} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={(e) => handleClick(e, 'up')}
        className={`p-0.5 rounded hover:bg-muted transition-colors ${
          userVote === 'up' ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        <ArrowBigUp className={iconSize} />
      </button>
      <span
        className={`${scoreClass} font-bold ${
          score > 0 ? 'text-primary' : score < 0 ? 'text-destructive' : 'text-muted-foreground'
        }`}
      >
        {score}
      </span>
      <button
        onClick={(e) => handleClick(e, 'down')}
        className={`p-0.5 rounded hover:bg-muted transition-colors ${
          userVote === 'down' ? 'text-destructive' : 'text-muted-foreground'
        }`}
      >
        <ArrowBigDown className={iconSize} />
      </button>
    </div>
  );
}
