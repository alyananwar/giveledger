"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { AISuggestionCard } from "@/components/AISuggestionCard";
import {
  Camera,
  Upload,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  ScanLine,
} from "lucide-react";
import Link from "next/link";
import { CameraCapture } from "@/components/CameraCapture";

interface AIAnalysis {
  category: string;
  subcategory: string;
  estimatedQuantity: number;
  unit: string;
  condition: string;
  estimatedValueUSD: number;
  confidence: "high" | "medium" | "low";
  notes: string;
  warnings: string[];
}

const UNITS = [
  "items",
  "boxes",
  "bags",
  "pounds",
  "gallons",
  "cases",
  "pallets",
];
const CONDITIONS = ["new", "good", "fair", "poor"];
const CATEGORIES = [
  "food",
  "clothing",
  "electronics",
  "hygiene",
  "furniture",
  "medical",
  "books",
  "toys",
  "other",
];

export default function LogPhysicalPage() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Form state (pre-filled by AI, editable by user)
  const [form, setForm] = useState({
    category: "",
    subcategory: "",
    quantity: "",
    unit: "items",
    condition: "good",
    estimatedValueUSD: "",
    notes: "",
  });

  const runAnalysis = useCallback(async (b64: string, mimeType: string) => {
    setBase64(b64);
    setAnalysis(null);
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: b64, mimeType }),
      });
      const { analysis: ai } = await res.json();
      setAnalysis(ai);
      setForm({
        category: ai.category || "",
        subcategory: ai.subcategory || "",
        quantity: String(ai.estimatedQuantity || ""),
        unit: ai.unit || "items",
        condition: ai.condition || "good",
        estimatedValueUSD: String(ai.estimatedValueUSD || ""),
        notes: ai.notes || "",
      });
    } catch {
      // user can fill manually
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const handleCameraCapture = useCallback(
    (b64: string, mimeType: string, previewUrl: string) => {
      setPreview(previewUrl);
      setShowCamera(false);
      runAnalysis(b64, mimeType);
    },
    [runAnalysis],
  );

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);
        const b64 = dataUrl.split(",")[1];
        await runAnalysis(b64, file.type);
      };
      reader.readAsDataURL(file);
    },
    [runAnalysis],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "physical",
          ...form,
          quantity: parseFloat(form.quantity) || 0,
          estimatedValueUSD: parseFloat(form.estimatedValueUSD) || 0,
          aiAnalysis: analysis,
          humanConfirmed: true,
          photoUrl: preview,
          donatedAt: new Date().toISOString(),
        }),
      });
      setSaved(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Live camera overlay */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

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
            Log Physical Donation
          </h1>
          <p className="text-sm text-gl-muted">
            Snap a photo — AI does the rest
          </p>
        </div>
      </div>

      {/* Camera / Upload toggle */}
      <div className="flex gap-3 mb-4">
        <button
          type="button"
          onClick={() => setShowCamera(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gl-purple bg-gl-purple/10 text-gl-purple font-semibold text-sm hover:bg-gl-purple/20 transition-colors cursor-pointer"
        >
          <ScanLine className="w-4 h-4" />
          Live Camera Scan
        </button>
        <div className="flex items-center gap-2 text-xs text-gl-muted px-2">
          or
        </div>
        <label className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gl-border text-gl-muted font-semibold text-sm hover:border-gl-raised hover:text-gl-text transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          Upload Photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = async (ev) => {
                const dataUrl = ev.target?.result as string;
                setPreview(dataUrl);
                await runAnalysis(dataUrl.split(",")[1], file.type);
              };
              reader.readAsDataURL(file);
            }}
          />
        </label>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer mb-6 overflow-hidden ${
          isDragActive
            ? "border-gl-purple bg-gl-purple/10"
            : preview
              ? "border-gl-border"
              : "border-gl-border hover:border-gl-purple/50 hover:bg-gl-purple/5"
        }`}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Donation preview"
              className="w-full max-h-72 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gl-bg/60 to-transparent" />
            <div className="absolute bottom-3 right-3 text-xs text-gl-muted bg-gl-surface/80 backdrop-blur px-3 py-1.5 rounded-full border border-gl-border">
              Click to replace photo
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gl-purple/10 border border-gl-purple/20 flex items-center justify-center">
              {isDragActive ? (
                <Upload className="w-6 h-6 text-gl-purple" />
              ) : (
                <Camera className="w-6 h-6 text-gl-purple" />
              )}
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-gl-text">
                {isDragActive ? "Drop to analyze" : "Drop a photo here"}
              </p>
              <p className="text-sm text-gl-muted mt-1">
                or click to browse — AI will identify and log the donation
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Analyzing state */}
      {analyzing && (
        <div className="border border-gl-purple/30 bg-gl-surface rounded-2xl p-6 mb-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gl-purple/20 flex items-center justify-center shrink-0">
            <Loader2 className="w-5 h-5 text-gl-purple animate-spin" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gl-text">
              Claude is analyzing your photo&hellip;
            </p>
            <p className="text-xs text-gl-muted mt-0.5">
              Identifying items, estimating quantity and value
            </p>
          </div>
          <div className="ml-auto h-1.5 w-32 bg-gl-raised rounded-full overflow-hidden">
            <div className="h-full bg-gl-purple rounded-full ai-shimmer" />
          </div>
        </div>
      )}

      {/* AI result */}
      {analysis && !analyzing && (
        <div className="mb-6">
          <AISuggestionCard analysis={analysis} />
        </div>
      )}

      {/* Confirm form */}
      {(analysis || preview) && !analyzing && (
        <form
          onSubmit={handleSubmit}
          className="bg-gl-surface border border-gl-border rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center gap-2 pb-4 border-b border-gl-border">
            <CheckCircle2 className="w-4 h-4 text-gl-green" />
            <p className="text-sm font-semibold text-gl-text">
              {analysis ? "Confirm AI Analysis" : "Enter Details Manually"}
            </p>
            <span className="ml-auto text-xs text-gl-muted">
              You can edit any field
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-gl-muted mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-gl-raised border border-gl-border rounded-xl px-3 py-2.5 text-sm text-gl-text focus:outline-none focus:border-gl-purple transition-colors"
                required
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-gl-muted mb-1.5">
                Description
              </label>
              <input
                type="text"
                placeholder="e.g. canned vegetables"
                value={form.subcategory}
                onChange={(e) =>
                  setForm({ ...form, subcategory: e.target.value })
                }
                className="w-full bg-gl-raised border border-gl-border rounded-xl px-3 py-2.5 text-sm text-gl-text placeholder-gl-muted/50 focus:outline-none focus:border-gl-purple transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-gl-muted mb-1.5">
                Quantity
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="48"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full bg-gl-raised border border-gl-border rounded-xl px-3 py-2.5 text-sm font-mono text-gl-text placeholder-gl-muted/50 focus:outline-none focus:border-gl-purple transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-gl-muted mb-1.5">
                Unit
              </label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full bg-gl-raised border border-gl-border rounded-xl px-3 py-2.5 text-sm text-gl-text focus:outline-none focus:border-gl-purple transition-colors"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-gl-muted mb-1.5">
                Condition
              </label>
              <select
                value={form.condition}
                onChange={(e) =>
                  setForm({ ...form, condition: e.target.value })
                }
                className="w-full bg-gl-raised border border-gl-border rounded-xl px-3 py-2.5 text-sm text-gl-text focus:outline-none focus:border-gl-purple transition-colors"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-gl-muted mb-1.5">
                Est. Value (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gl-muted text-sm">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="72.00"
                  value={form.estimatedValueUSD}
                  onChange={(e) =>
                    setForm({ ...form, estimatedValueUSD: e.target.value })
                  }
                  className="w-full bg-gl-raised border border-gl-border rounded-xl pl-7 pr-3 py-2.5 text-sm font-mono text-gl-gold placeholder-gl-muted/50 focus:outline-none focus:border-gl-purple transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-gl-muted mb-1.5">
              Notes (optional)
            </label>
            <textarea
              rows={2}
              placeholder="Any additional notes about this donation..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-gl-raised border border-gl-border rounded-xl px-3 py-2.5 text-sm text-gl-text placeholder-gl-muted/50 focus:outline-none focus:border-gl-purple transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving || saved}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer ${
              saved
                ? "bg-gl-green text-white"
                : "bg-gl-gold text-gl-bg hover:bg-gl-gold-light disabled:opacity-60"
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
              "Confirm & Log Donation"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
