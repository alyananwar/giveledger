"use client";

import { useEffect, useState } from "react";
import { Package, DollarSign, Loader2 } from "lucide-react";
import Link from "next/link";

interface DonationRow {
  id: string;
  type: string;
  amount: number | null;
  currency: string | null;
  source: string | null;
  donor_name: string | null;
  category: string | null;
  subcategory: string | null;
  quantity: number | null;
  unit: string | null;
  estimated_value_usd: number | null;
  human_confirmed: boolean;
  donated_at: string;
}

type Filter = "all" | "financial" | "physical";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function displayLabel(d: DonationRow) {
  if (d.type === "financial") return d.donor_name || "Anonymous";
  return d.subcategory || d.category || "Donation";
}

function displaySub(d: DonationRow) {
  if (d.type === "financial") return d.source || "—";
  const parts = [
    d.quantity && d.unit ? `${d.quantity} ${d.unit}` : null,
    d.category
      ? d.category.charAt(0).toUpperCase() + d.category.slice(1)
      : null,
  ].filter(Boolean);
  return parts.join(" · ") || "—";
}

function displayAmount(d: DonationRow) {
  const val = d.type === "financial" ? d.amount : d.estimated_value_usd;
  if (val == null) return "—";
  return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function totalValue(rows: DonationRow[]) {
  return rows.reduce((sum, d) => {
    const val = d.type === "financial" ? d.amount : d.estimated_value_usd;
    return sum + (val ?? 0);
  }, 0);
}

export default function HistoryPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [rows, setRows] = useState<DonationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url =
      filter === "all"
        ? "/api/donations?limit=200"
        : `/api/donations?type=${filter}&limit=200`;

    fetch(url)
      .then((r) => r.json())
      .then(({ donations }) => setRows(donations ?? []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const total = totalValue(rows);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "financial", label: "Financial" },
    { key: "physical", label: "Physical" },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gl-text">Donation History</h1>
          <p className="text-sm text-gl-muted mt-0.5">
            {loading ? (
              "Loading…"
            ) : (
              <>
                {rows.length} records · Total value{" "}
                <span className="text-gl-gold font-mono font-bold">
                  ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </>
            )}
          </p>
        </div>
        <Link
          href="/log/physical"
          className="flex items-center gap-2 text-sm font-semibold bg-gl-purple text-white px-4 py-2 rounded-xl hover:bg-gl-purple-light transition-colors cursor-pointer"
        >
          + Add Donation
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all duration-150 cursor-pointer ${
              filter === key
                ? "bg-gl-gold/10 border-gl-gold/40 text-gl-gold"
                : "border-gl-border text-gl-muted hover:border-gl-raised hover:text-gl-text"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gl-surface border border-gl-border rounded-2xl overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gl-border">
          {[
            "Type",
            "Description",
            "Source / Items",
            "Value",
            "Date",
            "Status",
          ].map((h) => (
            <div
              key={h}
              className={`text-[10px] font-semibold uppercase tracking-widest text-gl-muted ${
                h === "Description" || h === "Source / Items"
                  ? "col-span-3"
                  : "col-span-2"
              }`}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gl-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading donations…</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gl-muted">No donations found.</p>
            <Link
              href="/log/physical"
              className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-gl-purple hover:text-gl-purple-light transition-colors"
            >
              Log your first donation →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gl-border">
            {rows.map((d) => (
              <div
                key={d.id}
                className="grid grid-cols-12 gap-4 px-6 py-3.5 items-center hover:bg-gl-raised/40 transition-colors"
              >
                {/* Type */}
                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      d.type === "financial"
                        ? "bg-gl-gold/10 text-gl-gold border border-gl-gold/20"
                        : "bg-gl-purple/10 text-gl-purple border border-gl-purple/20"
                    }`}
                  >
                    {d.type === "financial" ? (
                      <DollarSign className="w-3 h-3" />
                    ) : (
                      <Package className="w-3 h-3" />
                    )}
                    {d.type === "financial" ? "Financial" : "Physical"}
                  </span>
                </div>

                {/* Description */}
                <div className="col-span-3">
                  <p className="text-sm font-semibold text-gl-text truncate">
                    {displayLabel(d)}
                  </p>
                </div>

                {/* Sub */}
                <div className="col-span-3">
                  <p className="text-sm text-gl-muted truncate">
                    {displaySub(d)}
                  </p>
                </div>

                {/* Value */}
                <div className="col-span-2">
                  <p className="font-mono text-sm font-bold text-gl-gold">
                    {displayAmount(d)}
                  </p>
                </div>

                {/* Date */}
                <div className="col-span-1">
                  <p className="text-xs text-gl-muted whitespace-nowrap">
                    {formatDate(d.donated_at)}
                  </p>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gl-green bg-gl-green/10 border border-gl-green/20 px-2 py-0.5 rounded-full">
                    Done
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
