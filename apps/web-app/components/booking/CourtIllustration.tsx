"use client";

import { cn } from "@/lib/utils";

interface CourtIllustrationProps {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  nameY: number;
  highlighted?: boolean;
  hovered?: boolean;
  count?: number;
  onHover?: (hovering: boolean) => void;
  onClick?: () => void;
}

/**
 * A single, landscape-oriented pickleball court drawn inline: outer boundary,
 * gold center net, dashed non-volley "kitchen" lines on both sides of the net,
 * and center service lines splitting each backcourt.
 */
export function CourtIllustration({
  x,
  y,
  width,
  height,
  name,
  nameY,
  highlighted,
  hovered,
  count,
  onHover,
  onClick,
}: CourtIllustrationProps) {
  const netX = x + width / 2;
  const kitchenInset = width * 0.159; // 7ft of a 44ft court
  const leftKitchenX = netX - kitchenInset;
  const rightKitchenX = netX + kitchenInset;
  const centerY = y + height / 2;
  const active = highlighted || hovered;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${name}${count ? `, ${count} selected` : ""}`}
      className={cn(
        "cursor-pointer transition-all duration-200 outline-none",
        active && "[filter:drop-shadow(0_0_5px_rgba(200,169,106,0.55))]"
      )}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      onFocus={() => onHover?.(true)}
      onBlur={() => onHover?.(false)}
      onClick={() => onClick?.()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={7}
        className={cn(
          "fill-emerald-light stroke-emerald-deep transition-colors duration-200",
          active && "fill-emerald-pale"
        )}
        strokeWidth={active ? 2.5 : 2}
      />

      {/* Kitchen (non-volley) lines */}
      <line
        x1={leftKitchenX}
        y1={y}
        x2={leftKitchenX}
        y2={y + height}
        className="stroke-emerald-deep/45"
        strokeWidth={1.25}
        strokeDasharray="4 3"
      />
      <line
        x1={rightKitchenX}
        y1={y}
        x2={rightKitchenX}
        y2={y + height}
        className="stroke-emerald-deep/45"
        strokeWidth={1.25}
        strokeDasharray="4 3"
      />

      {/* Center service lines */}
      <line
        x1={x}
        y1={centerY}
        x2={leftKitchenX}
        y2={centerY}
        className="stroke-emerald-deep/45"
        strokeWidth={1.25}
      />
      <line
        x1={rightKitchenX}
        y1={centerY}
        x2={x + width}
        y2={centerY}
        className="stroke-emerald-deep/45"
        strokeWidth={1.25}
      />

      {/* Gold net */}
      <line
        x1={netX}
        y1={y - 2}
        x2={netX}
        y2={y + height + 2}
        className="stroke-gold"
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* Gold highlight ring */}
      {active && (
        <rect
          x={x - 2}
          y={y - 2}
          width={width + 4}
          height={height + 4}
          rx={9}
          fill="none"
          className="stroke-gold"
          strokeWidth={1.5}
        />
      )}

      {/* Selected-hours badge */}
      {count !== undefined && count > 0 && (
        <g>
          <circle cx={x + width - 10} cy={y + 10} r={9} className="fill-gold" />
          <text
            x={x + width - 10}
            y={y + 10}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-emerald-deep text-[10px] font-semibold"
          >
            {count}
          </text>
        </g>
      )}

      <text
        x={x + width / 2}
        y={nameY}
        textAnchor="middle"
        className="fill-emerald-deep text-[11px] font-medium"
      >
        {name}
      </text>
    </g>
  );
}