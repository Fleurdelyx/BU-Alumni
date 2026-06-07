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

  const scoreColor =
    score > 0
      ? 'text-[hsl(var(--jungle))]'
      : score < 0
      ? 'text-[hsl(var(--terracotta))]'
      : 'text-[hsl(var(--slate))]';

  const upBtnClass =
    userVote === 'up'
      ? 'bg-[hsl(var(--jungle))] text-white shadow-sm'
      : 'text-[hsl(var(--slate))] hover:bg-[hsl(var(--muted))]';

  const downBtnClass =
    userVote === 'down'
      ? 'bg-[hsl(var(--terracotta))] text-white shadow-sm'
      : 'text-[hsl(var(--slate))] hover:bg-[hsl(var(--muted))]';

  if (orientation === 'horizontal') {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => handleClick(e, 'up')}
          className={`p-1.5 rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center ${upBtnClass}`}
        >
          <ArrowBigUp className={iconSize} strokeWidth={1.5} />
        </button>
        <span className={`${scoreClass} font-bold tabular-nums min-w-[1.5rem] text-center ${scoreColor}`}>
          {score}
        </span>
        <button
          onClick={(e) => handleClick(e, 'down')}
          className={`p-1.5 rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center ${downBtnClass}`}
        >
          <ArrowBigDown className={iconSize} strokeWidth={1.5} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={(e) => handleClick(e, 'up')}
        className={`p-1 rounded-lg transition-all duration-200 ${upBtnClass}`}
      >
        <ArrowBigUp className={iconSize} strokeWidth={1.5} />
      </button>
      <span className={`${scoreClass} font-bold tabular-nums ${scoreColor}`}>{score}</span>
      <button
        onClick={(e) => handleClick(e, 'down')}
        className={`p-1 rounded-lg transition-all duration-200 ${downBtnClass}`}
      >
        <ArrowBigDown className={iconSize} strokeWidth={1.5} />
      </button>
    </div>
  );
}
