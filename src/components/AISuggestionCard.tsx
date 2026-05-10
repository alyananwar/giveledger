import { Bot, AlertTriangle } from "lucide-react";

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

const confidenceStyles = {
  high: "text-gl-green bg-gl-green/10 border-gl-green/30",
  medium: "text-gl-yellow bg-gl-yellow/10 border-gl-yellow/30",
  low: "text-gl-red bg-gl-red/10 border-gl-red/30",
};

const confidenceBar = {
  high: "w-full bg-gl-green",
  medium: "w-2/3 bg-gl-yellow",
  low: "w-1/3 bg-gl-red",
};

export function AISuggestionCard({ analysis }: { analysis: AIAnalysis }) {
  const conf = analysis.confidence as "high" | "medium" | "low";

  return (
    <div className="border-l-4 border-gl-purple bg-gl-surface rounded-r-xl p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-gl-purple/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-gl-purple" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gl-text">AI Analysis</p>
          <p className="text-[11px] text-gl-muted">Powered by Claude</p>
        </div>
        <div
          className={`ml-auto px-2.5 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wide ${confidenceStyles[conf]}`}
        >
          {conf} confidence
        </div>
      </div>

      {/* Detected items */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gl-raised rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-widest text-gl-muted mb-1">
            Category
          </p>
          <p className="text-sm font-semibold text-gl-text capitalize">
            {analysis.category}
          </p>
          <p className="text-xs text-gl-muted capitalize">
            {analysis.subcategory}
          </p>
        </div>
        <div className="bg-gl-raised rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-widest text-gl-muted mb-1">
            Est. Quantity
          </p>
          <p className="text-sm font-semibold text-gl-text">
            {analysis.estimatedQuantity} {analysis.unit}
          </p>
          <p className="text-xs text-gl-muted capitalize">
            {analysis.condition} condition
          </p>
        </div>
        <div className="bg-gl-raised rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-widest text-gl-muted mb-1">
            Est. Value
          </p>
          <p className="text-sm font-semibold text-gl-gold">
            ${analysis.estimatedValueUSD.toLocaleString()}
          </p>
          <p className="text-xs text-gl-muted">Fair market value</p>
        </div>
        <div className="bg-gl-raised rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-widest text-gl-muted mb-1">
            Confidence
          </p>
          <div className="mt-1.5 h-1.5 bg-gl-border rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${confidenceBar[conf]}`} />
          </div>
          <p className="text-xs text-gl-muted mt-1 capitalize">{conf}</p>
        </div>
      </div>

      {/* Notes */}
      {analysis.notes && (
        <p className="text-xs italic text-gl-muted mb-3 leading-relaxed">
          &ldquo;{analysis.notes}&rdquo;
        </p>
      )}

      {/* Warnings */}
      {analysis.warnings && analysis.warnings.length > 0 && (
        <div className="space-y-1.5">
          {analysis.warnings.map((w, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs text-gl-yellow"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
