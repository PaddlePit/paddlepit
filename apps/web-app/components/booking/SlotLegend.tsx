"use client";

import { cn } from "@/lib/utils";
import type { SlotStatus } from "./SlotCell";

const LEGEND: Array<{ status: SlotStatus; label: string; swatch: string }> = [
  { status: "available", label: "Available", swatch: "border-emerald-deep/25 bg-emerald-light" },
  { status: "selected", label: "Selected", swatch: "border-gold bg-emerald-deep" },
  { status: "booked", label: "Booked", swatch: "border-clay-mid bg-clay-pale" },
  { status: "past", label: "Past", swatch: "border-transparent bg-emerald-deep/5" },
];

export function SlotLegend({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {LEGEND.map((item) => (
        <li key={item.status} className="flex items-center gap-1.5 text-xs text-emerald-deep/60">
          <span
            aria-hidden
            className={cn("inline-block size-3 rounded-[5px] border", item.swatch)}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}