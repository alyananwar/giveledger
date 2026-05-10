import { NextRequest, NextResponse } from "next/server";
import {
  addDemoDonation,
  DEMO_ORG_ID,
  getDemoDonations,
} from "@/lib/demo-data";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") || "50");

  if (!isSupabaseConfigured()) {
    const demoDonations = getDemoDonations();
    const donations = type
      ? demoDonations.filter((d) => d.type === type)
      : demoDonations;

    return NextResponse.json({ donations: donations.slice(0, limit) });
  }

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
    return NextResponse.json({ donations: getDemoDonations().slice(0, limit) });
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

    if (!isSupabaseConfigured()) {
      const donation = addDemoDonation(row);
      return NextResponse.json(
        {
          donation,
          demoMode: true,
        },
        { status: 201 },
      );
    }

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
