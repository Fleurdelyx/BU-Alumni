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
  LineChart,
  Line,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from 'next-themes';

const CHART_COLORS = [
  '#4C992D', // primary green
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#06B6D4', // cyan
  '#EC4899', // pink
  '#84CC16', // lime
];

type DegreeChartProps = {
  data: { degree: string; total: number }[];
};

type EmploymentChartProps = {
  data: { name: string; value: number }[];
};

type ProgramTrendChartProps = {
  data: Record<string, string | number>[];
  programs: string[];
};

type SalaryChartProps = {
  data: { program: string; average: number; count: number }[];
};

type IndustryChartProps = {
  data: { industry: string; count: number }[];
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

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
        <CartesianGrid vertical={false} strokeDasharray="4 4" stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
        <XAxis
          dataKey="degree"
          tickLine={false}
          tickMargin={12}
          axisLine={false}
          interval={0}
          tick={(props) => {
            const { x, y, payload } = props;
            const label = payload.value;
            const shortLabel = label.length > 18 ? `${label.substring(0, 15)}...` : label;
            return (
              <g transform={`translate(${x},${y})`}>
                <text
                  x={0}
                  y={0}
                  dy={12}
                  textAnchor="end"
                  fill={tickColor}
                  fontSize={10}
                  fontWeight={500}
                  transform="rotate(-35)"
                >
                  {shortLabel}
                </text>
              </g>
            );
          }}
        />
        <YAxis axisLine={false} tickLine={false} tickCount={6} tick={{ fill: tickColor, fontSize: 11 }} width={40} />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          contentStyle={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const item = payload[0];
            const color = item.payload.fill || item.color || CHART_COLORS[0];
            return (
              <div className="rounded-xl border border-border/60 bg-white/95 dark:bg-slate-900/95 px-4 py-3 shadow-xl backdrop-blur-sm">
                <p className="text-xs font-semibold text-foreground mb-1.5">{label}</p>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm text-muted-foreground">Respondents:</span>
                  <span className="text-sm font-bold text-foreground">{item.value?.toLocaleString()}</span>
                </div>
              </div>
            );
          }}
        />
        <Bar dataKey="total" radius={[8, 8, 0, 0]} barSize={40} animationDuration={1200} animationBegin={200}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              fillOpacity={0.9}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={1}
              strokeOpacity={0.3}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
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

  // Custom legend below the pie chart
  const LegendComp = () => (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-2">
      {data.map((entry, index) => {
        const color = CHART_COLORS[index % CHART_COLORS.length];
        const percent = total > 0 ? Math.round((entry.value / total) * 100) : 0;
        return (
          <div key={entry.name} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted-foreground">{entry.name}</span>
            <span className="text-xs font-semibold text-foreground">{percent}%</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full max-w-[300px] mx-auto">
      <div className="relative w-full aspect-square">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0];
                const color = item.payload.fill || item.color || CHART_COLORS[0];
                const name = item.name || 'Unknown';
                const value = item.value as number;
                const percent = total > 0 ? Math.round((value / total) * 100) : 0;
                return (
                  <div className="rounded-xl border border-border/60 bg-white/95 dark:bg-slate-900/95 px-4 py-3 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-sm font-semibold text-foreground">{name}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-5">
                      <span className="text-sm text-muted-foreground">Count:</span>
                      <span className="text-sm font-bold text-foreground">{value.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">({percent}%)</span>
                    </div>
                  </div>
                );
              }}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              paddingAngle={3}
              stroke="none"
              animationDuration={1400}
              animationBegin={300}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  fillOpacity={0.92}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  strokeOpacity={0.15}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
          <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Total</span>
          <span className="text-3xl font-bold text-card-foreground leading-none mt-1">{total.toLocaleString()}</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">alumni</span>
        </div>
      </div>
      <LegendComp />
    </div>
  );
}

export function ProgramTrendChart({ data, programs }: ProgramTrendChartProps) {
  const { theme } = useTheme();
  const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  if (!data.length || programs.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
        No trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
        <CartesianGrid vertical={false} strokeDasharray="4 4" stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
        <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fill: tickColor, fontSize: 11 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: tickColor, fontSize: 11 }} width={40} />
        <Tooltip
          contentStyle={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="rounded-xl border border-border/60 bg-white/95 dark:bg-slate-900/95 px-4 py-3 shadow-xl backdrop-blur-sm">
                <p className="text-xs font-semibold text-foreground mb-1.5">Year {label}</p>
                {payload.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-muted-foreground">{p.name}:</span>
                    <span className="font-bold text-foreground">{p.value}</span>
                  </div>
                ))}
              </div>
            );
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {programs.map((program, index) => (
          <Line
            key={program}
            type="monotone"
            dataKey={program}
            stroke={CHART_COLORS[index % CHART_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SalaryByProgramChart({ data }: SalaryChartProps) {
  const { theme } = useTheme();
  const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
        No salary data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 160, bottom: 20 }} layout="vertical">
        <CartesianGrid horizontal={false} strokeDasharray="4 4" stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
        <XAxis type="number" tick={{ fill: tickColor, fontSize: 11 }} tickFormatter={(v) => `₱${Number(v).toLocaleString()}`} />
        <YAxis
          type="category"
          dataKey="program"
          tickLine={false}
          axisLine={false}
          interval={0}
          width={150}
          tick={(props) => {
            const { x, y, payload } = props;
            const label = String(payload.value || '');
            const shortLabel = label.length > 28 ? `${label.substring(0, 25)}...` : label;
            return (
              <g transform={`translate(${x},${y})`}>
                <text
                  x={0}
                  y={0}
                  dy={4}
                  textAnchor="end"
                  fill={tickColor}
                  fontSize={10}
                  fontWeight={500}
                >
                  {shortLabel}
                </text>
              </g>
            );
          }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          contentStyle={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const item = payload[0].payload;
            return (
              <div className="rounded-xl border border-border/60 bg-white/95 dark:bg-slate-900/95 px-4 py-3 shadow-xl backdrop-blur-sm">
                <p className="text-xs font-semibold text-foreground mb-1.5">{label}</p>
                <div className="text-xs text-muted-foreground">
                  Average salary: <span className="font-bold text-foreground">₱{Number(item.average).toLocaleString()}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Based on <span className="font-bold text-foreground">{item.count}</span> reported earnings
                </div>
              </div>
            );
          }}
        />
        <Bar dataKey="average" radius={[0, 8, 8, 0]} barSize={14} fill="#4C992D" fillOpacity={0.9} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function IndustryChart({ data }: IndustryChartProps) {
  const { theme } = useTheme();
  const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
        No industry data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
        <CartesianGrid vertical={false} strokeDasharray="4 4" stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
        <XAxis
          dataKey="industry"
          tickLine={false}
          axisLine={false}
          interval={0}
          height={80}
          tick={(props) => {
            const { x, y, payload } = props;
            const label = String(payload.value || '');
            const words = label.split(' ');
            const lines: string[] = [];
            let current = '';
            words.forEach((word) => {
              if ((current + ' ' + word).trim().length > 16) {
                if (current) lines.push(current);
                current = word;
              } else {
                current = current ? `${current} ${word}` : word;
              }
            });
            if (current) lines.push(current);
            const display = lines.slice(0, 2);
            if (lines.length > 2) display[1] = `${display[1].substring(0, 12)}...`;
            return (
              <g transform={`translate(${x},${y})`}>
                {display.map((line, i) => (
                  <text
                    key={i}
                    x={0}
                    y={i * 12}
                    dy={12}
                    textAnchor="end"
                    fill={tickColor}
                    fontSize={9}
                    fontWeight={500}
                    transform="rotate(-35)"
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          }}
        />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: tickColor, fontSize: 11 }} width={40} />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          contentStyle={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="rounded-xl border border-border/60 bg-white/95 dark:bg-slate-900/95 px-4 py-3 shadow-xl backdrop-blur-sm">
                <p className="text-xs font-semibold text-foreground mb-1.5">{label}</p>
                <div className="text-xs text-muted-foreground">
                  Alumni: <span className="font-bold text-foreground">{payload[0].value}</span>
                </div>
              </div>
            );
          }}
        />
        <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={32}>
          {data.map((_, index) => (
            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} fillOpacity={0.9} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
