import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const DEMO_ORG_ID = "demo-org-food-for-all";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") || "50");

  let query = supabaseAdmin
    .from("donations")
    .select("*")
    .eq("org_id", DEMO_ORG_ID)
    .order("donated_at", { ascending: false })
    .limit(limit);

  if (type) query = query.eq("type", type);

  const { data, error } = await query;

  if (error) {
    console.error("Donations fetch error:", error);
    return NextResponse.json({ donations: DEMO_DONATIONS });
  }

  return NextResponse.json({ donations: data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const row = {
      org_id: DEMO_ORG_ID,
      type: body.type,
      amount: body.amount ?? null,
      currency: body.currency || "USD",
      source: body.source || null,
      donor_name: body.donorName || null,
      notes: body.notes || null,
      photo_url: body.photoUrl || null,
      category: body.category || null,
      subcategory: body.subcategory || null,
      quantity: body.quantity ?? null,
      unit: body.unit || null,
      condition: body.condition || null,
      estimated_value_usd: body.estimatedValueUSD ?? null,
      ai_analysis: body.aiAnalysis ?? null,
      human_confirmed: body.humanConfirmed ?? true,
      donated_at: body.donatedAt || new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("donations")
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error("Donation insert error:", error);
      return NextResponse.json(
        { error: "Failed to save donation" },
        { status: 500 },
      );
    }

    return NextResponse.json({ donation: data }, { status: 201 });
  } catch (err) {
    console.error("Donation create error:", err);
    return NextResponse.json(
      { error: "Failed to save donation" },
      { status: 500 },
    );
  }
}

const DEMO_DONATIONS = [
  {
    id: "d1",
    org_id: DEMO_ORG_ID,
    type: "financial",
    amount: 5000,
    currency: "USD",
    source: "Stripe",
    donor_name: "Acme Corp",
    human_confirmed: true,
    donated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "d2",
    org_id: DEMO_ORG_ID,
    type: "physical",
    category: "food",
    subcategory: "canned goods",
    quantity: 240,
    unit: "items",
    estimated_value_usd: 360,
    condition: "good",
    human_confirmed: true,
    donated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "d3",
    org_id: DEMO_ORG_ID,
    type: "financial",
    amount: 1200,
    currency: "USD",
    source: "PayPal",
    donor_name: "Jane Smith",
    human_confirmed: true,
    donated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "d4",
    org_id: DEMO_ORG_ID,
    type: "physical",
    category: "clothing",
    subcategory: "winter coats",
    quantity: 85,
    unit: "items",
    estimated_value_usd: 2125,
    condition: "good",
    human_confirmed: true,
    donated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "d5",
    org_id: DEMO_ORG_ID,
    type: "financial",
    amount: 750,
    currency: "USD",
    source: "Check",
    donor_name: "Anonymous",
    human_confirmed: true,
    donated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "d6",
    org_id: DEMO_ORG_ID,
    type: "physical",
    category: "hygiene",
    subcategory: "toiletries",
    quantity: 120,
    unit: "items",
    estimated_value_usd: 480,
    condition: "new",
    human_confirmed: true,
    donated_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
];
