import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function getForumIcon(name: string | null): LucideIcon {
  const iconName = name || 'MessageSquare';
  const Icon = (Icons as Record<string, LucideIcon | undefined>)[iconName] || Icons.MessageSquare;
  return Icon;
}
