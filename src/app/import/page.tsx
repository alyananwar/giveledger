"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  X,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface ParsedRow {
  amount: number;
  currency: string;
  source: string;
  donorName: string;
  notes: string;
  donatedAt: string;
  _raw: Record<string, string>;
  _valid: boolean;
}

type FormatName =
  | "PayPal"
  | "eTapestry"
  | "GiveSmart"
  | "DonorSupport"
  | "Generic";

interface DetectedFormat {
  name: FormatName;
  confidence: "high" | "medium" | "low";
  description: string;
}

// Known CSV column mappings for each platform
const FORMAT_SIGNATURES: Record<
  FormatName,
  { required: string[]; description: string }
> = {
  PayPal: {
    required: ["Date", "Name", "Gross", "Status"],
    description: "PayPal transaction export",
  },
  eTapestry: {
    required: ["Gift Date", "Donor Name", "Gift Amount"],
    description: "eTapestry / Blackbaud export",
  },
  GiveSmart: {
    required: ["Date", "Donor Name", "Total Amount"],
    description: "GiveSmart event export",
  },
  DonorSupport: {
    required: ["Date", "Donor", "Amount", "Fund"],
    description: "DonorSupport / Yolo Food Bank export",
  },
  Generic: {
    required: [],
    description: "Generic donation CSV",
  },
};

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split(",")
    .map((h) => h.replace(/^"|"$/g, "").trim());
  return lines.slice(1).map((line) => {
    const values =
      line.match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g) || [];
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] || "").replace(/^"|"$/g, "").trim();
    });
    return row;
  });
}

function detectFormat(headers: string[]): DetectedFormat {
  const headerSet = new Set(headers.map((h) => h.trim()));

  for (const [name, sig] of Object.entries(FORMAT_SIGNATURES)) {
    if (name === "Generic") continue;
    const matched = sig.required.filter((r) => headerSet.has(r)).length;
    if (matched === sig.required.length) {
      return {
        name: name as FormatName,
        confidence: "high",
        description: sig.description,
      };
    }
    if (matched >= Math.ceil(sig.required.length * 0.6)) {
      return {
        name: name as FormatName,
        confidence: "medium",
        description: sig.description,
      };
    }
  }

  return {
    name: "Generic",
    confidence: "low",
    description: "Unknown format — please map columns manually",
  };
}

function mapRow(
  raw: Record<string, string>,
  format: FormatName,
): Omit<ParsedRow, "_raw" | "_valid"> {
  const get = (...keys: string[]) => {
    for (const k of keys) {
      if (raw[k] !== undefined && raw[k] !== "") return raw[k];
    }
    return "";
  };

  switch (format) {
    case "PayPal": {
      const gross = parseFloat(get("Gross").replace(/,/g, "")) || 0;
      return {
        amount: Math.abs(gross),
        currency: get("Currency") || "USD",
        source: "PayPal",
        donorName: get("Name") || "Anonymous",
        notes: get("Item Title", "Subject") || "",
        donatedAt: get("Date") || new Date().toISOString().split("T")[0],
      };
    }
    case "eTapestry": {
      return {
        amount: parseFloat(get("Gift Amount").replace(/[$,]/g, "")) || 0,
        currency: "USD",
        source: "eTapestry / Blackbaud",
        donorName: get("Donor Name", "First Name") || "Anonymous",
        notes: get("Fund", "Campaign", "Note") || "",
        donatedAt: get("Gift Date") || new Date().toISOString().split("T")[0],
      };
    }
    case "GiveSmart": {
      return {
        amount:
          parseFloat(get("Total Amount", "Amount").replace(/[$,]/g, "")) || 0,
        currency: "USD",
        source: "GiveSmart",
        donorName: get("Donor Name", "Name") || "Anonymous",
        notes: get("Transaction Type", "Item") || "",
        donatedAt: get("Date") || new Date().toISOString().split("T")[0],
      };
    }
    case "DonorSupport": {
      return {
        amount: parseFloat(get("Amount").replace(/[$,]/g, "")) || 0,
        currency: "USD",
        source: "DonorSupport",
        donorName: get("Donor", "Name") || "Anonymous",
        notes: get("Fund", "Campaign") || "",
        donatedAt: get("Date") || new Date().toISOString().split("T")[0],
      };
    }
    default: {
      const amountRaw = get(
        "amount",
        "Amount",
        "total",
        "Total",
        "gross",
        "Gross",
      );
      const dateRaw = get("date", "Date", "donated_at", "DonatedAt");
      return {
        amount: parseFloat(amountRaw.replace(/[$,]/g, "")) || 0,
        currency: get("currency", "Currency") || "USD",
        source: get("source", "Source", "platform", "Platform") || "CSV Import",
        donorName:
          get("donor", "Donor", "name", "Name", "donor_name") || "Anonymous",
        notes: get("notes", "Notes", "memo", "Memo", "description") || "",
        donatedAt: dateRaw || new Date().toISOString().split("T")[0],
      };
    }
  }
}

function processCSV(text: string): {
  rows: ParsedRow[];
  format: DetectedFormat;
} {
  const rawRows = parseCSV(text);
  if (rawRows.length === 0)
    return {
      rows: [],
      format: { name: "Generic", confidence: "low", description: "" },
    };

  const headers = Object.keys(rawRows[0]);
  const format = detectFormat(headers);

  const rows: ParsedRow[] = rawRows.map((raw) => {
    const mapped = mapRow(raw, format.name);
    return {
      ...mapped,
      _raw: raw,
      _valid: mapped.amount > 0,
    };
  });

  return { rows, format };
}

export default function ImportPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [format, setFormat] = useState<DetectedFormat | null>(null);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [importCount, setImportCount] = useState(0);

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { rows: parsed, format: detected } = processCSV(text);
      setRows(parsed);
      setFormat(detected);
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "text/plain": [".txt"] },
    maxFiles: 1,
    multiple: false,
  });

  const validRows = rows.filter((r) => r._valid);
  const invalidRows = rows.filter((r) => !r._valid);

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validRows }),
      });
      const data = await res.json();
      setImportCount(data.imported || validRows.length);
      setImported(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } finally {
      setImporting(false);
    }
  };

  const removeRow = (i: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard"
          className="w-8 h-8 rounded-lg border border-gl-border flex items-center justify-center text-gl-muted hover:text-gl-text hover:border-gl-raised transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gl-text">Import Donations</h1>
          <p className="text-sm text-gl-muted">
            Upload a CSV export from PayPal, DonorSupport, GiveSmart, eTapestry,
            or any platform
          </p>
        </div>
      </div>

      {/* Supported platforms */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          "PayPal",
          "DonorSupport",
          "GiveSmart",
          "eTapestry / Blackbaud",
          "MightyCause",
          "Generic CSV",
        ].map((p) => (
          <span
            key={p}
            className="px-3 py-1 rounded-full text-xs font-medium border border-gl-border text-gl-muted bg-gl-surface"
          >
            {p}
          </span>
        ))}
      </div>

      {/* Drop zone */}
      {rows.length === 0 && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer mb-6 ${
            isDragActive
              ? "border-gl-gold bg-gl-gold/5"
              : "border-gl-border hover:border-gl-gold/50 hover:bg-gl-gold/3"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gl-gold/10 border border-gl-gold/20 flex items-center justify-center">
              {isDragActive ? (
                <Upload className="w-7 h-7 text-gl-gold" />
              ) : (
                <FileSpreadsheet className="w-7 h-7 text-gl-gold" />
              )}
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-gl-text">
                {isDragActive ? "Drop your CSV here" : "Drop a CSV file here"}
              </p>
              <p className="text-sm text-gl-muted mt-1">
                or click to browse — we&apos;ll auto-detect the format
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {rows.length > 0 && format && (
        <>
          {/* Format detection banner */}
          <div
            className={`flex items-center gap-3 p-4 rounded-xl border mb-5 ${
              format.confidence === "high"
                ? "border-gl-green/30 bg-gl-green/5"
                : format.confidence === "medium"
                  ? "border-gl-gold/30 bg-gl-gold/5"
                  : "border-gl-border bg-gl-surface"
            }`}
          >
            <FileSpreadsheet
              className={`w-5 h-5 shrink-0 ${
                format.confidence === "high"
                  ? "text-gl-green"
                  : format.confidence === "medium"
                    ? "text-gl-gold"
                    : "text-gl-muted"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gl-text">
                {fileName} &mdash; detected as{" "}
                <span className="text-gl-gold">{format.name}</span>
              </p>
              <p className="text-xs text-gl-muted mt-0.5">
                {format.description}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                  format.confidence === "high"
                    ? "bg-gl-green/20 text-gl-green"
                    : format.confidence === "medium"
                      ? "bg-gl-gold/20 text-gl-gold"
                      : "bg-gl-raised text-gl-muted"
                }`}
              >
                {format.confidence} confidence
              </span>
              <button
                onClick={() => {
                  setRows([]);
                  setFormat(null);
                  setFileName("");
                }}
                className="text-gl-muted hover:text-gl-text transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="bg-gl-surface border border-gl-border rounded-xl p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gl-muted mb-1">
                Total Rows
              </p>
              <p className="text-2xl font-mono font-bold text-gl-text">
                {rows.length}
              </p>
            </div>
            <div className="bg-gl-surface border border-gl-green/20 rounded-xl p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gl-muted mb-1">
                Ready to Import
              </p>
              <p className="text-2xl font-mono font-bold text-gl-green">
                {validRows.length}
              </p>
            </div>
            <div className="bg-gl-surface border border-gl-border rounded-xl p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gl-muted mb-1">
                Total Value
              </p>
              <p className="text-2xl font-mono font-bold text-gl-gold">
                $
                {validRows
                  .reduce((s, r) => s + r.amount, 0)
                  .toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </p>
            </div>
          </div>

          {/* Invalid rows warning */}
          {invalidRows.length > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 mb-5">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
              <p className="text-sm text-gl-muted">
                <span className="text-yellow-500 font-semibold">
                  {invalidRows.length} rows
                </span>{" "}
                have missing or zero amounts and will be skipped.
              </p>
            </div>
          )}

          {/* Preview table */}
          <div className="bg-gl-surface border border-gl-border rounded-2xl overflow-hidden mb-6">
            <div className="px-5 py-3 border-b border-gl-border flex items-center justify-between">
              <p className="text-sm font-semibold text-gl-text">Preview</p>
              <p className="text-xs text-gl-muted">
                {validRows.length} valid donations
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gl-border">
                    {["Date", "Donor", "Source", "Amount", "Notes", ""].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gl-muted"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-b border-gl-border/50 last:border-0 transition-colors ${
                        row._valid ? "hover:bg-gl-raised/50" : "opacity-40"
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gl-muted whitespace-nowrap">
                        {row.donatedAt}
                      </td>
                      <td className="px-4 py-3 text-gl-text max-w-[160px] truncate">
                        {row.donorName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gl-raised text-gl-muted border border-gl-border">
                          {row.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-gl-gold whitespace-nowrap">
                        {row._valid ? (
                          `$${row.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                        ) : (
                          <span className="text-red-400 text-xs">Invalid</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gl-muted text-xs max-w-[200px] truncate">
                        {row.notes || <span className="text-gl-border">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeRow(i)}
                          className="text-gl-muted hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Import button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleImport}
              disabled={importing || imported || validRows.length === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer ${
                imported
                  ? "bg-gl-green text-white"
                  : "bg-gl-gold text-gl-bg hover:bg-gl-gold-light disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              {imported ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Imported {importCount} donations!
                </>
              ) : importing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  Import {validRows.length} Donations
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-xs text-gl-muted">
              ${validRows.reduce((s, r) => s + r.amount, 0).toLocaleString()}{" "}
              total
            </p>
          </div>
        </>
      )}
    </div>
  );
}
