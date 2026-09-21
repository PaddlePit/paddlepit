"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CourtIllustration } from "./CourtIllustration";
import { formatMoney } from "@/lib/money";
import type { Court } from "@/types/booking";

const COURT_W = 150;
const COURT_H = 58;
const GAP = 14;
const PAD = 6;
const NAME_SPACE = 18;

interface CourtMapPreviewProps {
  courts: Court[];
  highlightedCourtIds: string[];
  countByCourt?: Record<string, number>;
  onCourtClick?: (courtId: string) => void;
  hoveredCourtId?: string | null;
  onHoverCourt?: (courtId: string | null) => void;
  currency: { symbol: string; code: string; minorUnit: number };
  className?: string;
}

export function CourtMapPreview({
  courts,
  highlightedCourtIds,
  countByCourt,
  onCourtClick,
  hoveredCourtId,
  onHoverCourt,
  currency,
  className,
}: CourtMapPreviewProps) {
  const width = PAD * 2 + courts.length * COURT_W + Math.max(0, courts.length - 1) * GAP;
  const height = PAD * 2 + COURT_H + NAME_SPACE;
  const highlighted = new Set(highlightedCourtIds);

  return (
    <section
      className={cn(
        "rounded-2xl border border-emerald-deep/10 bg-cream px-3 py-2.5 shadow-sm sm:px-4 sm:py-3",
        className
      )}
    >
      <h3 className="mb-1.5 text-[10px] font-semibold tracking-wider text-emerald-deep/40 uppercase">
        Court Map
      </h3>
      <div className="overflow-x-auto overscroll-x-contain pb-0.5">
        <TooltipProvider delayDuration={120}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="mx-auto block h-auto max-h-[130px]"
            style={{ width: "100%", maxWidth: width }}
            role="group"
            aria-label="Court map"
          >
            {courts.map((court, index) => {
              const x = PAD + index * (COURT_W + GAP);
              const y = PAD;
              const isHovered = hoveredCourtId === court.id;
              const count = countByCourt?.[court.id] ?? 0;
              return (
                <Tooltip key={court.id}>
                  <TooltipTrigger asChild>
                    <CourtIllustration
                      x={x}
                      y={y}
                      width={COURT_W}
                      height={COURT_H}
                      name={court.name}
                      nameY={y + COURT_H + 13}
                      highlighted={highlighted.has(court.id)}
                      hovered={isHovered}
                      count={count}
                      onHover={(hovering) => onHoverCourt?.(hovering ? court.id : null)}
                      onClick={() => onCourtClick?.(court.id)}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="font-medium">{court.name}</span>
                    <span className="text-cream/60">
                      {" "}
                      · {formatMoney(court.hourlyRateMinor, currency)}/hr
                    </span>
                    {count > 0 && (
                      <span className="text-gold">
                        {" "}
                        · {count} hr{count === 1 ? "" : "s"} selected
                      </span>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </svg>
        </TooltipProvider>
      </div>
    </section>
  );
}