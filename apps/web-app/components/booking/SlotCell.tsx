"use client";

import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

export type SlotStatus = "past" | "available" | "selected" | "booked";

export const SLOT_STATUS_TEXT: Record<SlotStatus, string> = {
  past: "Past",
  available: "Available",
  selected: "Selected",
  booked: "Booked",
};

interface SlotCellProps {
  status: SlotStatus;
  /** Accessible label, e.g. "Court 2, 5 PM to 6 PM, Available" */
  label: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  columnHovered?: boolean;
  className?: string;
}

export function SlotCell({
  status,
  label,
  onClick,
  onMouseEnter,
  columnHovered,
  className,
}: SlotCellProps) {
  const disabled = status === "past" || status === "booked";
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={status === "selected"}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        "relative flex h-12 w-full items-center justify-center rounded-xl border text-xs font-medium",
        "transition-all duration-150 outline-none select-none",
        "focus-visible:ring-2 focus-visible:ring-gold/60",
        status === "past" && "cursor-not-allowed border-transparent text-emerald-deep/25",
        status === "available" &&
          "border-emerald-deep/25 bg-emerald-light text-emerald-deep hover:border-emerald-deep/50 hover:bg-emerald-pale active:scale-[0.97]",
        status === "selected" &&
          "border-gold bg-emerald-deep text-cream shadow-sm ring-2 ring-gold/40 active:scale-[0.97]",
        status === "booked" && "cursor-not-allowed border-clay-mid bg-clay-pale text-clay-deep",
        columnHovered && status === "available" && "border-gold/60 bg-emerald-pale",
        columnHovered && status === "past" && "bg-emerald-deep/[0.03]",
        columnHovered && status === "booked" && "ring-1 ring-clay-mid/60",
        className
      )}
    >
      <span className="flex items-center gap-1">
        {status === "selected" && (
          <HugeiconsIcon icon={Tick02Icon} strokeWidth={2.5} className="size-3" />
        )}
        {SLOT_STATUS_TEXT[status]}
      </span>
    </button>
  );
}