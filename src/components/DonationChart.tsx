"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartPoint {
  date: string;
  financial: number;
  physical: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gl-raised border border-gl-border rounded-xl p-3 text-xs shadow-xl">
      <p className="text-gl-muted mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-mono font-semibold text-gl-text">
          {p.name === "financial" ? "Financial" : "Physical"} $
          {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export function DonationChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart
        data={data}
        margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="financialGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="physicalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#334155"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fill: "#94A3B8", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval={6}
        />
        <YAxis
          tick={{ fill: "#94A3B8", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="financial"
          stroke="#F59E0B"
          strokeWidth={2}
          fill="url(#financialGrad)"
          dot={false}
          activeDot={{
            r: 4,
            fill: "#F59E0B",
            stroke: "#0F172A",
            strokeWidth: 2,
          }}
        />
        <Area
          type="monotone"
          dataKey="physical"
          stroke="#8B5CF6"
          strokeWidth={2}
          fill="url(#physicalGrad)"
          dot={false}
          activeDot={{
            r: 4,
            fill: "#8B5CF6",
            stroke: "#0F172A",
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
