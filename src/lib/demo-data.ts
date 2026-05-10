import type { DonationRow } from "./donations";

export const DEMO_ORG_ID = "demo-org-food-for-all";

function daysAgo(days: number) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

const initialDemoDonations: DonationRow[] = [
  {
    id: "demo-financial-1",
    org_id: DEMO_ORG_ID,
    type: "financial",
    amount: 5000,
    currency: "USD",
    source: "Stripe",
    donor_name: "Acme Corp",
    notes: "Corporate matching gift",
    photo_url: null,
    category: null,
    subcategory: null,
    quantity: null,
    unit: null,
    condition: null,
    estimated_value_usd: null,
    ai_analysis: null,
    human_confirmed: true,
    donated_at: daysAgo(1),
    created_at: daysAgo(1),
  },
  {
    id: "demo-physical-1",
    org_id: DEMO_ORG_ID,
    type: "physical",
    amount: null,
    currency: "USD",
    source: null,
    donor_name: "Davis Community Pantry",
    notes: "AI suggested estimate, confirmed by volunteer",
    photo_url: null,
    category: "food",
    subcategory: "canned goods",
    quantity: 240,
    unit: "items",
    condition: "good",
    estimated_value_usd: 360,
    ai_analysis: { confidence: "high" },
    human_confirmed: true,
    donated_at: daysAgo(2),
    created_at: daysAgo(2),
  },
  {
    id: "demo-financial-2",
    org_id: DEMO_ORG_ID,
    type: "financial",
    amount: 1200,
    currency: "USD",
    source: "PayPal",
    donor_name: "Jane Smith",
    notes: "Monthly donor campaign",
    photo_url: null,
    category: null,
    subcategory: null,
    quantity: null,
    unit: null,
    condition: null,
    estimated_value_usd: null,
    ai_analysis: null,
    human_confirmed: true,
    donated_at: daysAgo(3),
    created_at: daysAgo(3),
  },
  {
    id: "demo-physical-2",
    org_id: DEMO_ORG_ID,
    type: "physical",
    amount: null,
    currency: "USD",
    source: null,
    donor_name: "Winter Drive",
    notes: "Coats sorted and counted by intake team",
    photo_url: null,
    category: "clothing",
    subcategory: "winter coats",
    quantity: 85,
    unit: "items",
    condition: "good",
    estimated_value_usd: 2125,
    ai_analysis: { confidence: "medium" },
    human_confirmed: true,
    donated_at: daysAgo(4),
    created_at: daysAgo(4),
  },
  {
    id: "demo-financial-3",
    org_id: DEMO_ORG_ID,
    type: "financial",
    amount: 750,
    currency: "USD",
    source: "Check",
    donor_name: "Anonymous",
    notes: "General operations",
    photo_url: null,
    category: null,
    subcategory: null,
    quantity: null,
    unit: null,
    condition: null,
    estimated_value_usd: null,
    ai_analysis: null,
    human_confirmed: true,
    donated_at: daysAgo(5),
    created_at: daysAgo(5),
  },
  {
    id: "demo-physical-3",
    org_id: DEMO_ORG_ID,
    type: "physical",
    amount: null,
    currency: "USD",
    source: null,
    donor_name: "Health Fair",
    notes: "New toiletries for family kits",
    photo_url: null,
    category: "hygiene",
    subcategory: "toiletries",
    quantity: 120,
    unit: "items",
    condition: "new",
    estimated_value_usd: 480,
    ai_analysis: { confidence: "high" },
    human_confirmed: true,
    donated_at: daysAgo(6),
    created_at: daysAgo(6),
  },
];

type DemoStoreGlobal = typeof globalThis & {
  [key: symbol]: DonationRow[] | undefined;
};

const DEMO_STORE_KEY = Symbol.for("giveledger.demoDonations");

function getDemoStore() {
  const globalStore = globalThis as DemoStoreGlobal;

  if (!globalStore[DEMO_STORE_KEY]) {
    globalStore[DEMO_STORE_KEY] = [...initialDemoDonations];
  }

  return globalStore[DEMO_STORE_KEY];
}

export function getDemoDonations() {
  return getDemoStore();
}

export function addDemoDonation(
  donation: Omit<DonationRow, "id" | "created_at"> & {
    id?: string;
    created_at?: string;
  },
) {
  const now = new Date().toISOString();
  const row: DonationRow = {
    id: donation.id || `demo-${Date.now()}`,
    created_at: donation.created_at || now,
    ...donation,
  };

  getDemoStore().unshift(row);
  return row;
}
