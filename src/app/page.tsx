import Link from "next/link";
import {
  ArrowRight,
  Camera,
  BarChart3,
  DollarSign,
  Bot,
  Heart,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gl-bg text-gl-text overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4">
        <div className="flex items-center justify-between bg-gl-surface/80 backdrop-blur-md border border-gl-border rounded-2xl px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gl-gold flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-gl-bg" fill="currentColor" />
            </div>
            <span className="font-bold text-base tracking-tight">
              Give<span className="text-gl-gold">Ledger</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-gl-purple bg-gl-purple/10 border border-gl-purple/20 px-3 py-1.5 rounded-full">
              <Bot className="w-3 h-3" /> Powered by Claude AI
            </span>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm font-semibold bg-gl-gold text-gl-bg px-4 py-2 rounded-xl hover:bg-gl-gold-light transition-colors duration-150 cursor-pointer"
            >
              Try Demo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-4 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gl-gold bg-gl-gold/10 border border-gl-gold/20 px-4 py-2 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-gl-gold animate-pulse" />
          HackDavis 2026 — Built for Social Good
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
          Stop guessing.
          <br />
          <span className="text-gl-gold">Start proving</span>
          <br />
          your impact.
        </h1>

        <p className="text-lg sm:text-xl text-gl-muted max-w-2xl mx-auto leading-relaxed mb-10">
          GiveLedger gives every nonprofit — no matter how small — a unified
          record of every dollar donated and every box received. Snap a photo,
          AI does the rest.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-gl-gold text-gl-bg font-bold text-base px-8 py-4 rounded-xl hover:bg-gl-gold-light transition-all duration-150 shadow-lg shadow-gl-gold/20 cursor-pointer"
          >
            See the Demo <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/log/physical"
            className="flex items-center gap-2 bg-gl-purple/10 border border-gl-purple/30 text-gl-purple font-semibold text-base px-8 py-4 rounded-xl hover:bg-gl-purple/20 transition-all duration-150 cursor-pointer"
          >
            <Camera className="w-5 h-5" /> Try AI Photo Log
          </Link>
        </div>

        {/* Trust bar */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-xs text-gl-muted">
          {[
            "Free forever for nonprofits",
            "No data sold. Ever.",
            "Works offline for photo capture",
          ].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-gl-green" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* Bento Features Grid */}
      <section className="px-4 pb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Feature 1 — AI Photo (big card) */}
          <div className="sm:col-span-2 lg:col-span-2 bg-gl-surface border border-gl-border rounded-2xl p-7 hover:border-gl-purple/40 transition-colors duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-gl-purple/20 flex items-center justify-center mb-4 group-hover:bg-gl-purple/30 transition-colors">
              <Camera className="w-5 h-5 text-gl-purple" />
            </div>
            <h3 className="text-xl font-bold text-gl-text mb-2">
              AI Photo Recognition
            </h3>
            <p className="text-gl-muted text-sm leading-relaxed mb-5">
              Snap a photo of any donation — pallets, boxes, bags, clothing
              racks. Claude AI identifies the item type, estimates quantity,
              assesses condition, and calculates fair market value. You confirm
              in one tap.
            </p>
            {/* Mock AI card preview */}
            <div className="border-l-4 border-gl-purple bg-gl-raised rounded-r-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-4 h-4 text-gl-purple" />
                <span className="text-xs font-semibold text-gl-purple">
                  AI detected
                </span>
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-gl-green bg-gl-green/10 border border-gl-green/30 px-2 py-0.5 rounded-full">
                  High confidence
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-gl-muted mb-0.5">Category</p>
                  <p className="font-semibold text-gl-text">Food / Canned</p>
                </div>
                <div>
                  <p className="text-gl-muted mb-0.5">Quantity</p>
                  <p className="font-semibold text-gl-text">48 items</p>
                </div>
                <div>
                  <p className="text-gl-muted mb-0.5">Est. Value</p>
                  <p className="font-semibold text-gl-gold">$72</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 — Financial tracking */}
          <div className="bg-gl-surface border border-gl-border rounded-2xl p-7 hover:border-gl-gold/40 transition-colors duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-gl-gold/20 flex items-center justify-center mb-4 group-hover:bg-gl-gold/30 transition-colors">
              <DollarSign className="w-5 h-5 text-gl-gold" />
            </div>
            <h3 className="text-xl font-bold text-gl-text mb-2">
              Financial Tracking
            </h3>
            <p className="text-gl-muted text-sm leading-relaxed">
              Log donations from Stripe, PayPal, checks, and cash. Upload CSV
              exports from any payment platform. Every dollar, documented.
            </p>
          </div>

          {/* Feature 3 — Dashboard */}
          <div className="bg-gl-surface border border-gl-border rounded-2xl p-7 hover:border-gl-green/40 transition-colors duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-gl-green/20 flex items-center justify-center mb-4 group-hover:bg-gl-green/30 transition-colors">
              <BarChart3 className="w-5 h-5 text-gl-green" />
            </div>
            <h3 className="text-xl font-bold text-gl-text mb-2">
              Impact Dashboard
            </h3>
            <p className="text-gl-muted text-sm leading-relaxed">
              See your donation trends, category breakdowns, and total impact
              value at a glance. The data story you need for grant applications,
              donors, and boards.
            </p>
          </div>

          {/* Stats strip */}
          <div className="sm:col-span-2 grid grid-cols-3 gap-4">
            {[
              { value: "1.8M+", label: "Nonprofits with no tracking tool" },
              { value: "$500B", label: "Donated annually in the US" },
              { value: "0", label: "AI-powered donation loggers before today" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="bg-gl-surface border border-gl-border rounded-2xl p-5 text-center"
              >
                <p className="font-mono text-2xl font-bold text-gl-gold">
                  {value}
                </p>
                <p className="text-xs text-gl-muted mt-1 leading-relaxed">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 pb-24 max-w-3xl mx-auto text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gl-muted mb-3">
          How it works
        </p>
        <h2 className="text-3xl font-bold text-gl-text mb-12">
          From donation to data in{" "}
          <span className="text-gl-purple">three steps</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          {[
            {
              step: "01",
              title: "Log the donation",
              desc: "Snap a photo of physical items or enter financial donation details manually.",
            },
            {
              step: "02",
              title: "AI does the work",
              desc: "Claude identifies items, estimates quantities, and calculates fair market value.",
            },
            {
              step: "03",
              title: "You confirm",
              desc: "Review the AI's analysis, correct anything, and hit confirm. Done in seconds.",
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex flex-col gap-3">
              <span className="font-mono text-4xl font-bold text-gl-border">
                {step}
              </span>
              <h4 className="text-base font-semibold text-gl-text">{title}</h4>
              <p className="text-sm text-gl-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 pb-24 max-w-2xl mx-auto text-center">
        <div className="bg-gl-surface border border-gl-border rounded-2xl p-10">
          <h2 className="text-3xl font-bold text-gl-text mb-3">
            Built for nonprofits that{" "}
            <span className="text-gl-gold">can&apos;t afford</span> to lose
            track.
          </h2>
          <p className="text-gl-muted text-sm mb-8">
            Free forever. No credit card. No enterprise contracts.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-gl-gold text-gl-bg font-bold px-8 py-4 rounded-xl hover:bg-gl-gold-light transition-colors cursor-pointer"
          >
            Open Dashboard <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gl-border px-4 py-8 text-center text-xs text-gl-muted">
        <span>
          Built at HackDavis 2026 &mdash; GiveLedger &mdash; Social Good Track
        </span>
      </footer>
    </div>
  );
}
