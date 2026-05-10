import { DEMO_ORG_ID, getDemoDonations } from "./demo-data";
import { isSupabaseConfigured, supabaseAdmin } from "./supabase";

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

export async function getDashboardStats(): Promise<DashboardStats | null> {
  if (!isSupabaseConfigured()) return buildDashboardStats(getDemoDonations());

  const { data, error } = await supabaseAdmin
    .from("donations")
    .select("type, amount, estimated_value_usd, donor_name, donated_at")
    .eq("org_id", DEMO_ORG_ID);

  if (error || !data) return buildDashboardStats(getDemoDonations());

  return buildDashboardStats(data as DonationRow[]);
}

export async function getRecentDonations(limit = 6): Promise<DonationRow[]> {
  if (!isSupabaseConfigured()) return getDemoDonations().slice(0, limit);

  const { data } = await supabaseAdmin
    .from("donations")
    .select("*")
    .eq("org_id", DEMO_ORG_ID)
    .order("donated_at", { ascending: false })
    .limit(limit);

  return ((data as DonationRow[]) ?? getDemoDonations()).slice(0, limit);
}

export async function getAllDonations(type?: string): Promise<DonationRow[]> {
  if (!isSupabaseConfigured()) return filterDemoDonations(type);

  let query = supabaseAdmin
    .from("donations")
    .select("*")
    .eq("org_id", DEMO_ORG_ID)
    .order("donated_at", { ascending: false })
    .limit(200);

  if (type && type !== "all") query = query.eq("type", type);

  const { data, error } = await query;
  if (error || !data) return filterDemoDonations(type);
  return data as DonationRow[];
}

export async function getChartData(days = 30): Promise<ChartPoint[]> {
  if (!isSupabaseConfigured()) return buildChartFromRows(getDemoDonations(), days);

  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  const { data, error } = await supabaseAdmin
    .from("donations")
    .select("type, amount, estimated_value_usd, donated_at")
    .eq("org_id", DEMO_ORG_ID)
    .gte("donated_at", from.toISOString())
    .order("donated_at", { ascending: true });

  if (error || !data) return buildChartFromRows(getDemoDonations(), days);

  return buildChartFromRows(data as DonationRow[], days);
}

export async function getCategoryBreakdown() {
  if (!isSupabaseConfigured()) return buildCategoryBreakdown(getDemoDonations());

  const { data, error } = await supabaseAdmin
    .from("donations")
    .select("category, estimated_value_usd")
    .eq("org_id", DEMO_ORG_ID)
    .eq("type", "physical");

  if (error || !data || data.length === 0) {
    return buildCategoryBreakdown(getDemoDonations());
  }

  return buildCategoryBreakdown(data as DonationRow[]);
}

function buildDashboardStats(rows: DonationRow[]): DashboardStats {
  const now = new Date();
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();

  const financial = rows.filter((d) => d.type === "financial");
  const physical = rows.filter((d) => d.type === "physical");

  return {
    totalRaised: financial.reduce((s, d) => s + (d.amount ?? 0), 0),
    physicalValue: physical.reduce(
      (s, d) => s + (d.estimated_value_usd ?? 0),
      0,
    ),
    logsThisMonth: rows.filter((d) => d.donated_at >= startOfMonth).length,
    uniqueDonors: new Set(rows.map((d) => d.donor_name).filter(Boolean)).size,
  };
}

function filterDemoDonations(type?: string) {
  if (type && type !== "all") {
    return getDemoDonations().filter((d) => d.type === type);
  }
  return getDemoDonations();
}

function buildChartFromRows(rows: DonationRow[], days: number): ChartPoint[] {
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

  for (const row of rows) {
    const key = row.donated_at.split("T")[0];
    if (map[key]) {
      if (row.type === "financial") map[key].financial += row.amount ?? 0;
      if (row.type === "physical")
        map[key].physical += row.estimated_value_usd ?? 0;
    }
  }

  return Object.values(map);
}

function buildCategoryBreakdown(rows: DonationRow[]) {
  const totals: Record<string, number> = {};
  for (const row of rows.filter((d) => d.type === "physical")) {
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
