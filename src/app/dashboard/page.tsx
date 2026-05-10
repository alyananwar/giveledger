import { StatCard } from "@/components/StatCard";
import { DonationChart } from "@/components/DonationChart";
import {
  getDashboardStats,
  getRecentDonations,
  getChartData,
  getCategoryBreakdown,
  type DonationRow,
} from "@/lib/donations";
import {
  Camera,
  DollarSign,
  Package,
  Shirt,
  Utensils,
  Droplets,
  Plus,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

const CATEGORY_COLORS: Record<string, string> = {
  food: "bg-gl-gold",
  clothing: "bg-gl-purple",
  hygiene: "bg-gl-green",
  books: "bg-gl-blue",
  electronics: "bg-gl-red",
  medical: "bg-gl-red",
  other: "bg-gl-raised",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  food: <Utensils className="w-3.5 h-3.5" />,
  clothing: <Shirt className="w-3.5 h-3.5" />,
  hygiene: <Droplets className="w-3.5 h-3.5" />,
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

function donationLabel(d: DonationRow) {
  if (d.type === "financial") return d.donor_name || "Anonymous";
  return d.subcategory || d.category || "Donation";
}

function donationSub(d: DonationRow) {
  if (d.type === "financial") return d.source ? `via ${d.source}` : "—";
  const parts = [
    d.quantity && d.unit ? `${d.quantity} ${d.unit}` : null,
    d.category
      ? d.category.charAt(0).toUpperCase() + d.category.slice(1)
      : null,
  ].filter(Boolean);
  return parts.join(" · ") || "—";
}

function donationAmount(d: DonationRow) {
  const val = d.type === "financial" ? d.amount : d.estimated_value_usd;
  if (val == null) return "—";
  return `$${val.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

export default async function DashboardPage() {
  const [stats, recent, chartData, categories] = await Promise.all([
    getDashboardStats(),
    getRecentDonations(6),
    getChartData(30),
    getCategoryBreakdown(),
  ]);

  const notConfigured = stats === null;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gl-text">Impact Dashboard</h1>
          <p className="text-sm text-gl-muted mt-0.5">
            Food for All Foundation
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/log/financial"
            className="flex items-center gap-2 text-sm font-semibold border border-gl-border text-gl-muted px-4 py-2.5 rounded-xl hover:border-gl-gold/40 hover:text-gl-gold transition-all cursor-pointer"
          >
            <DollarSign className="w-4 h-4" /> Log Financial
          </Link>
          <Link
            href="/log/physical"
            className="flex items-center gap-2 text-sm font-semibold bg-gl-purple text-white px-4 py-2.5 rounded-xl hover:bg-gl-purple-light transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4" /> AI Photo Log
          </Link>
        </div>
      </div>

      {/* Supabase not configured warning */}
      {notConfigured && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 mb-6">
          <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-400">
              Supabase not configured
            </p>
            <p className="text-xs text-gl-muted mt-0.5">
              Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to see
              live data.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Raised"
          value={
            notConfigured
              ? "—"
              : `$${stats.totalRaised.toLocaleString("en-US", { minimumFractionDigits: 0 })}`
          }
          sub="All-time financial donations"
          accent="gold"
        />
        <StatCard
          label="Physical Value"
          value={
            notConfigured
              ? "—"
              : `$${stats.physicalValue.toLocaleString("en-US", { minimumFractionDigits: 0 })}`
          }
          sub="Fair market value logged"
          accent="purple"
        />
        <StatCard
          label="Logs This Month"
          value={notConfigured ? "—" : String(stats.logsThisMonth)}
          sub="Financial + physical combined"
          accent="green"
        />
        <StatCard
          label="Donors"
          value={notConfigured ? "—" : String(stats.uniqueDonors)}
          sub="Unique contributors"
          accent="default"
        />
      </div>

      {/* Chart + Category split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-gl-surface border border-gl-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-gl-text">
                Donation Trend
              </h2>
              <p className="text-xs text-gl-muted">Last 30 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gl-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gl-gold inline-block" />
                Financial
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gl-purple inline-block" />
                Physical
              </span>
            </div>
          </div>
          <DonationChart data={chartData} />
        </div>

        {/* Category breakdown */}
        <div className="bg-gl-surface border border-gl-border rounded-2xl p-6">
          <h2 className="text-base font-semibold text-gl-text mb-5">
            By Category
          </h2>
          {categories.length === 0 ? (
            <p className="text-sm text-gl-muted">No physical donations yet.</p>
          ) : (
            <div className="space-y-4">
              {categories.map(({ label, value, pct }) => (
                <div key={label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gl-muted font-medium">{label}</span>
                    <span className="font-mono font-semibold text-gl-text">
                      ${value.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gl-raised rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${CATEGORY_COLORS[label.toLowerCase()] ?? "bg-gl-muted"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gl-surface border border-gl-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gl-border">
          <h2 className="text-base font-semibold text-gl-text">
            Recent Activity
          </h2>
          <Link
            href="/history"
            className="text-xs text-gl-muted hover:text-gl-gold transition-colors cursor-pointer"
          >
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-gl-muted">No donations logged yet.</p>
            <Link
              href="/log/physical"
              className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-gl-purple hover:text-gl-purple-light transition-colors"
            >
              <Camera className="w-4 h-4" /> Log your first donation
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gl-border">
            {recent.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-gl-raised/50 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    item.type === "financial"
                      ? "bg-gl-gold/15 text-gl-gold"
                      : "bg-gl-purple/15 text-gl-purple"
                  }`}
                >
                  {item.type === "financial" ? (
                    <DollarSign className="w-4 h-4" />
                  ) : (
                    (CATEGORY_ICONS[item.category ?? ""] ?? (
                      <Package className="w-4 h-4" />
                    ))
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gl-text truncate">
                    {donationLabel(item)}
                  </p>
                  <p className="text-xs text-gl-muted">{donationSub(item)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-sm font-bold text-gl-gold">
                    {donationAmount(item)}
                  </p>
                  <p className="text-[11px] text-gl-muted">
                    {relativeTime(item.donated_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <Link
        href="/log/physical"
        className="fixed bottom-8 right-8 w-14 h-14 bg-gl-purple rounded-2xl shadow-lg shadow-gl-purple/30 flex items-center justify-center hover:bg-gl-purple-light hover:scale-105 transition-all duration-150 cursor-pointer z-40"
        title="AI Photo Log"
      >
        <Plus className="w-6 h-6 text-white" />
      </Link>
    </div>
  );
}
