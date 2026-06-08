'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedCounter } from './animated-counter';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  accentColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  miniBarValue?: number; // 0-100 for the mini bar fill
  miniBarColor?: string;
  delay?: number; // animation delay in ms
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  accentColor = '#4C992D',
  trend,
  trendValue,
  miniBarValue,
  miniBarColor = '#4C992D',
  delay = 0,
}: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-slate';

  return (
    <Card
      className="relative overflow-hidden border-mist/60 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`,
        }}
      />

      {/* Left colored border accent */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: accentColor }}
      />

      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
        <CardTitle className="text-sm font-semibold text-card-foreground/80 tracking-tight">
          {title}
        </CardTitle>
        <div
          className={`h-9 w-9 rounded-lg flex items-center justify-center ${iconBg} shadow-inner`}
          style={{ boxShadow: `inset 0 1px 2px ${accentColor}22` }}
        >
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="flex items-baseline gap-2">
          <AnimatedCounter
            value={value}
            className="text-3xl font-bold text-card-foreground tracking-tight"
          />
          {trend && trendValue && (
            <span className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
              <TrendIcon className="h-3 w-3" />
              {trendValue}
            </span>
          )}
        </div>

        {/* Mini horizontal bar */}
        {miniBarValue !== undefined && (
          <div className="mt-3">
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(Math.max(miniBarValue, 0), 100)}%`,
                  backgroundColor: miniBarColor,
                  transitionDelay: `${delay + 200}ms`,
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
