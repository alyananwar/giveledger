"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Camera,
  DollarSign,
  History,
  Heart,
  FileUp,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/log/physical", label: "Log Physical", icon: Camera },
  { href: "/log/financial", label: "Log Financial", icon: DollarSign },
  { href: "/history", label: "History", icon: History },
  { href: "/import", label: "Import CSV", icon: FileUp },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 flex flex-col border-r border-gl-border bg-gl-surface min-h-screen">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gl-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gl-gold flex items-center justify-center">
            <Heart className="w-4 h-4 text-gl-bg" fill="currentColor" />
          </div>
          <span className="font-bold text-lg tracking-tight text-gl-text">
            Give<span className="text-gl-gold">Ledger</span>
          </span>
        </div>
        {/* Org name */}
        <div className="mt-3">
          <p className="text-[11px] font-medium uppercase tracking-widest text-gl-muted">
            Organization
          </p>
          <p className="text-sm font-semibold text-gl-text mt-0.5 truncate">
            Food for All Foundation
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                active
                  ? "bg-gl-gold/10 text-gl-gold border border-gl-gold/20"
                  : "text-gl-muted hover:text-gl-text hover:bg-gl-raised"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Quick log CTA */}
      <div className="px-4 py-4 border-t border-gl-border">
        <Link
          href="/log/physical"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-gl-purple text-white text-sm font-semibold hover:bg-gl-purple-light transition-colors duration-150 cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          AI Photo Log
        </Link>
      </div>
    </aside>
  );
}
