'use client';

import { Badge } from '@/components/ui/badge';
import type { ForumCategory } from '@/lib/types';

interface CategoryBadgeProps {
  category: ForumCategory | null;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  if (!category) return null;

  return (
    <Badge
      variant="outline"
      className="text-xs"
      style={{
        borderColor: category.color || undefined,
        color: category.color || undefined,
      }}
    >
      {category.name}
    </Badge>
  );
}
