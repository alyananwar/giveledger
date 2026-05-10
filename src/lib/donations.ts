import { supabaseAdmin } from "./supabase";

const DEMO_ORG_ID = "demo-org-food-for-all";

export interface DonationRow {
  id: string;
  org_id: string;
  type: string;
  amount: number | null;
  currency: string | null;
  source: string | null;
  donor_name: string | null;
  notes: string | null;
  photo_url: string | null;
  category: string | null;
  subcategory: string | null;
  quantity: number | null;
  unit: string | null;
  condition: string | null;
  estimated_value_usd: number | null;
  ai_analysis: unknown;
  human_confirmed: boolean;
  donated_at: string;
  created_at: string;
}

export interface ChartPoint {
  date: string;
  financial: number;
  physical: number;
}

export interface DashboardStats {
  totalRaised: number;
  physicalValue: number;
  logsThisMonth: number;
  uniqueDonors: number;
}

function isConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  if (!isConfigured()) return null;

  const { data, error } = await supabaseAdmin
    .from("donations")
    .select("type, amount, estimated_value_usd, donor_name, donated_at")
    .eq("org_id", DEMO_ORG_ID);

  if (error || !data) return null;

  const now = new Date();
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();

  const financial = data.filter((d) => d.type === "financial");
  const physical = data.filter((d) => d.type === "physical");

  return {
    totalRaised: financial.reduce((s, d) => s + (d.amount ?? 0), 0),
    physicalValue: physical.reduce(
      (s, d) => s + (d.estimated_value_usd ?? 0),
      0,
    ),
    logsThisMonth: data.filter((d) => d.donated_at >= startOfMonth).length,
    uniqueDonors: new Set(data.map((d) => d.donor_name).filter(Boolean)).size,
  };
}

export async function getRecentDonations(limit = 6): Promise<DonationRow[]> {
  if (!isConfigured()) return [];

  const { data } = await supabaseAdmin
    .from("donations")
    .select("*")
    .eq("org_id", DEMO_ORG_ID)
    .order("donated_at", { ascending: false })
    .limit(limit);

  return (data as DonationRow[]) ?? [];
}

export async function getAllDonations(type?: string): Promise<DonationRow[]> {
  if (!isConfigured()) return [];

  let query = supabaseAdmin
    .from("donations")
    .select("*")
    .eq("org_id", DEMO_ORG_ID)
    .order("donated_at", { ascending: false })
    .limit(200);

  if (type && type !== "all") query = query.eq("type", type);

  const { data } = await query;
  return (data as DonationRow[]) ?? [];
}

export async function getChartData(days = 30): Promise<ChartPoint[]> {
  const empty = buildEmptyChart(days);
  if (!isConfigured()) return empty;

  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  const { data } = await supabaseAdmin
    .from("donations")
    .select("type, amount, estimated_value_usd, donated_at")
    .eq("org_id", DEMO_ORG_ID)
    .gte("donated_at", from.toISOString())
    .order("donated_at", { ascending: true });

  // Build day-keyed map seeded with zeros
  const map: Record<string, ChartPoint> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const key = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    map[key] = { date: label, financial: 0, physical: 0 };
  }

  for (const row of data ?? []) {
    const key = (row.donated_at as string).split("T")[0];
    if (map[key]) {
      if (row.type === "financial") map[key].financial += row.amount ?? 0;
      if (row.type === "physical")
        map[key].physical += row.estimated_value_usd ?? 0;
    }
  }

  return Object.values(map);
}

export async function getCategoryBreakdown() {
  if (!isConfigured()) return [];

  const { data } = await supabaseAdmin
    .from("donations")
    .select("category, estimated_value_usd")
    .eq("org_id", DEMO_ORG_ID)
    .eq("type", "physical");

  if (!data || data.length === 0) return [];

  const totals: Record<string, number> = {};
  for (const row of data) {
    const cat = row.category || "other";
    totals[cat] = (totals[cat] ?? 0) + (row.estimated_value_usd ?? 0);
  }

  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
  if (grandTotal === 0) return [];

  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, value]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      value,
      pct: Math.round((value / grandTotal) * 100),
    }));
}

function buildEmptyChart(days: number): ChartPoint[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      financial: 0,
      physical: 0,
    };
  });
}
