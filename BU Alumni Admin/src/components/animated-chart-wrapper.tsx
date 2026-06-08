'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface AnimatedChartWrapperProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedChartWrapper({ children, delay = 0, className = '' }: AnimatedChartWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-all duration-700 ease-out ${className} ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {children}
    </div>
  );
}
