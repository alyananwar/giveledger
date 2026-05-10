import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const DEMO_ORG_ID = "demo-org-food-for-all";

// PayPal IPN endpoint — configure in PayPal → Account Settings → Notifications
// URL: https://your-domain.com/api/webhooks/paypal

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = new URLSearchParams(body);

  const txnType = params.get("txn_type") || "";
  const paymentStatus = params.get("payment_status") || "";

  const isDonation =
    txnType === "web_accept" ||
    txnType === "cart" ||
    txnType === "express_checkout" ||
    txnType === "recurring_payment";

  if (!isDonation || paymentStatus !== "Completed") {
    return new NextResponse("OK", { status: 200 });
  }

  const amountRaw = params.get("mc_gross") || params.get("amount") || "0";
  const currency = params.get("mc_currency") || "USD";
  const firstName = params.get("first_name") || "";
  const lastName = params.get("last_name") || "";
  const donorName =
    [firstName, lastName].filter(Boolean).join(" ") || "Anonymous";
  const payerEmail = params.get("payer_email") || "";
  const itemName = params.get("item_name") || "";
  const txnId = params.get("txn_id") || "";

  try {
    await supabaseAdmin.from("donations").insert({
      org_id: DEMO_ORG_ID,
      type: "financial",
      amount: parseFloat(amountRaw),
      currency,
      source: "PayPal",
      donor_name: payerEmail ? `${donorName} (${payerEmail})` : donorName,
      notes: [itemName, `PayPal TXN: ${txnId}`].filter(Boolean).join(" · "),
      human_confirmed: true,
      donated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("PayPal webhook error:", err);
  }

  return new NextResponse("OK", { status: 200 });
}
