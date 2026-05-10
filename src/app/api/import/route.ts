import { NextRequest, NextResponse } from "next/server";
import { addDemoDonation, DEMO_ORG_ID } from "@/lib/demo-data";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { rows } = await req.json();

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }

  const docs = rows.map(
    (r: {
      amount: number;
      currency?: string;
      source?: string;
      donorName?: string;
      notes?: string;
      donatedAt?: string;
    }) => ({
      org_id: DEMO_ORG_ID,
      type: "financial",
      amount: r.amount,
      currency: r.currency || "USD",
      source: r.source || "CSV Import",
      donor_name: r.donorName || "Anonymous",
      notes: r.notes || "",
      human_confirmed: true,
      donated_at: r.donatedAt
        ? new Date(r.donatedAt).toISOString()
        : new Date().toISOString(),
    }),
  );

  if (!isSupabaseConfigured()) {
    docs.forEach((doc) =>
      addDemoDonation({
        ...doc,
        amount: doc.amount,
        currency: doc.currency,
        source: doc.source,
        donor_name: doc.donor_name,
        notes: doc.notes,
        photo_url: null,
        category: null,
        subcategory: null,
        quantity: null,
        unit: null,
        condition: null,
        estimated_value_usd: null,
        ai_analysis: null,
      }),
    );

    return NextResponse.json({ imported: docs.length, demoMode: true });
  }

  const { error } = await supabaseAdmin.from("donations").insert(docs);

  if (error) {
    console.error("CSV import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }

  return NextResponse.json({ imported: docs.length });
}
