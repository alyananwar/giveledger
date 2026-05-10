"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, DollarSign, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

const SOURCES = [
  "PayPal",
  "DonorSupport",
  "Big Day of Giving",
  "GiveSmart",
  "Stripe",
  "Donorbox",
  "MightyCause",
  "eTapestry / Blackbaud",
  "Check",
  "Cash",
  "Bank Transfer",
  "Other",
];

export default function LogFinancialPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    currency: "USD",
    source: "",
    donorName: "",
    notes: "",
    donatedAt: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "financial",
          ...form,
          amount: parseFloat(form.amount),
          donatedAt: new Date(form.donatedAt).toISOString(),
          humanConfirmed: true,
        }),
      });
      setSaved(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard"
          className="w-8 h-8 rounded-lg border border-gl-border flex items-center justify-center text-gl-muted hover:text-gl-text hover:border-gl-raised transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gl-text">
            Log Financial Donation
          </h1>
          <p className="text-sm text-gl-muted">
            Record a monetary donation from any source
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-gl-surface border border-gl-border rounded-2xl p-6 space-y-5"
      >
        {/* Amount */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-gl-muted mb-1.5">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gl-muted">
              <DollarSign className="w-4 h-4" />
            </span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full bg-gl-raised border border-gl-border rounded-xl pl-10 pr-4 py-3 text-2xl font-mono font-bold text-gl-gold placeholder-gl-muted/40 focus:outline-none focus:border-gl-gold transition-colors"
              required
            />
          </div>
        </div>

        {/* Source */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-gl-muted mb-1.5">
            Source
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {SOURCES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm({ ...form, source: s })}
                className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all duration-150 cursor-pointer ${
                  form.source === s
                    ? "bg-gl-gold/10 border-gl-gold/40 text-gl-gold"
                    : "border-gl-border text-gl-muted hover:border-gl-raised hover:text-gl-text"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Donor name */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-gl-muted mb-1.5">
            Donor Name{" "}
            <span className="normal-case text-gl-muted/60 font-normal">
              (optional)
            </span>
          </label>
          <input
            type="text"
            placeholder="Anonymous"
            value={form.donorName}
            onChange={(e) => setForm({ ...form, donorName: e.target.value })}
            className="w-full bg-gl-raised border border-gl-border rounded-xl px-4 py-2.5 text-sm text-gl-text placeholder-gl-muted/50 focus:outline-none focus:border-gl-gold transition-colors"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-gl-muted mb-1.5">
            Date Received
          </label>
          <input
            type="date"
            value={form.donatedAt}
            onChange={(e) => setForm({ ...form, donatedAt: e.target.value })}
            className="w-full bg-gl-raised border border-gl-border rounded-xl px-4 py-2.5 text-sm font-mono text-gl-text focus:outline-none focus:border-gl-gold transition-colors"
            required
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-gl-muted mb-1.5">
            Notes{" "}
            <span className="normal-case text-gl-muted/60 font-normal">
              (optional)
            </span>
          </label>
          <textarea
            rows={3}
            placeholder="Grant reference, purpose, restrictions..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full bg-gl-raised border border-gl-border rounded-xl px-4 py-2.5 text-sm text-gl-text placeholder-gl-muted/50 focus:outline-none focus:border-gl-gold transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving || saved || !form.amount || !form.source}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer ${
            saved
              ? "bg-gl-green text-white"
              : "bg-gl-gold text-gl-bg hover:bg-gl-gold-light disabled:opacity-50 disabled:cursor-not-allowed"
          }`}
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Logged! Redirecting...
            </>
          ) : saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            "Log Donation"
          )}
        </button>
      </form>
    </div>
  );
}
