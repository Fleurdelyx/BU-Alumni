import {
  Megaphone,
  Briefcase,
  Users,
  TrendingUp,
  University,
  Star,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  megaphone: Megaphone,
  briefcase: Briefcase,
  users: Users,
  'trending-up': TrendingUp,
  university: University,
  star: Star,
  'message-circle': MessageCircle,
};

export function getForumIcon(name: string | null): LucideIcon {
  if (!name) return MessageCircle;
  return iconMap[name] || MessageCircle;
}
