'use client';

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Pie,
  PieChart,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useTheme } from 'next-themes';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
];

type DegreeChartProps = {
  data: { degree: string; total: number }[];
};

type EmploymentChartProps = {
  data: { name: string; value: number }[];
};

export function DegreeChart({ data }: DegreeChartProps) {
  const { theme } = useTheme();
  const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
        No data available
      </div>
    );
  }

  const courseChartConfig = {
    total: {
      label: 'Respondents',
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={courseChartConfig} className="h-[350px] w-full">
      <BarChart
        accessibilityLayer
        data={data}
        margin={{ top: 20, right: 30, left: 10, bottom: 60 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.15} />
        <XAxis
          dataKey="degree"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          interval={0}
          tick={(props) => {
            const { x, y, payload } = props;
            const label = payload.value;
            const shortLabel = label.length > 20 ? `${label.substring(0, 17)}...` : label;
            return (
              <g transform={`translate(${x},${y})`}>
                <text
                  x={0}
                  y={0}
                  dy={16}
                  textAnchor="end"
                  fill={tickColor}
                  fontSize={10}
                  transform="rotate(-45)"
                >
                  {shortLabel}
                </text>
              </g>
            );
          }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickCount={6}
          tick={{ fill: tickColor }}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
          content={<ChartTooltipContent />}
        />
        <Bar
          dataKey="total"
          radius={[6, 6, 0, 0]}
          barSize={36}
          animationDuration={1200}
          animationBegin={200}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function EmploymentChart({ data }: EmploymentChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
        No data available
      </div>
    );
  }

  const jobFieldChartConfig = {
    value: {
      label: 'Alumni',
    },
  } satisfies ChartConfig;

  return (
    <div className="relative w-full aspect-square max-w-[300px] mx-auto">
      <ChartContainer config={jobFieldChartConfig} className="h-full w-full">
        <PieChart>
          <Tooltip content={<ChartTooltipContent nameKey="name" />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="68%"
            outerRadius="96%"
            paddingAngle={4}
            stroke="none"
            animationDuration={1400}
            animationBegin={300}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                fillOpacity={0.9}
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
        <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
          Total
        </span>
        <span className="text-4xl font-bold text-card-foreground leading-none mt-1">
          {total}
        </span>
      </div>
    </div>
  );
}
