import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      {...props}
      className={cn('fill-current', props.className)}
    >
      {/* External circular border */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" />
      
      {/* Internal circular border for text region */}
      <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" />
      
      {/* Decorative center background */}
      <circle cx="50" cy="50" r="32" fill="currentColor" opacity="0.1" />
      
      {/* Central Bold "BU" text */}
      <text
        x="50"
        y="58"
        fontFamily="serif"
        fontSize="36"
        textAnchor="middle"
        fill="currentColor"
        fontWeight="900"
      >
        BU
      </text>

      {/* Establishment Date at the bottom */}
      <text
        x="50"
        y="72"
        fontFamily="sans-serif"
        fontSize="6"
        textAnchor="middle"
        fill="currentColor"
        fontWeight="bold"
      >
        1925
      </text>

      {/* Decorative Ornaments (Dots) between circular borders */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30) * (Math.PI / 180);
        const x = 50 + 40 * Math.cos(angle);
        const y = 50 + 40 * Math.sin(angle);
        return <circle key={i} cx={x} cy={y} r="1.2" fill="currentColor" />;
      })}

      {/* Inner thin ring for focus */}
      <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}
