'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PaginationProps {
  hasMore: boolean;
  onLoadMore: () => void;
  loading?: boolean;
  label?: string;
}

export function Pagination({
  hasMore,
  onLoadMore,
  loading = false,
  label = 'Load more',
}: PaginationProps) {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center py-4">
      <Button variant="outline" onClick={onLoadMore} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        {label}
      </Button>
    </div>
  );
}
