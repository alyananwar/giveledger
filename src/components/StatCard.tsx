import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  accent?: "gold" | "purple" | "green" | "default";
}

const accentMap = {
  gold: "text-gl-gold",
  purple: "text-gl-purple",
  green: "text-gl-green",
  default: "text-gl-text",
};

export function StatCard({
  label,
  value,
  sub,
  trend,
  accent = "default",
}: StatCardProps) {
  const valueColor = accentMap[accent];

  return (
    <div className="bg-gl-surface border border-gl-border rounded-xl p-5 flex flex-col gap-3 hover:border-gl-raised transition-colors duration-150">
      <p className="text-[11px] font-medium uppercase tracking-widest text-gl-muted">
        {label}
      </p>
      <div className="flex items-end justify-between gap-2">
        <span
          className={`font-mono text-3xl font-bold tracking-tight ${valueColor}`}
        >
          {value}
        </span>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold mb-1 ${
              trend >= 0 ? "text-gl-green" : "text-gl-red"
            }`}
          >
            {trend >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      {sub && <p className="text-xs text-gl-muted">{sub}</p>}
    </div>
  );
}
