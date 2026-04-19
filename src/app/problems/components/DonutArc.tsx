"use client";

import { useMemo } from "react";
import type { Problem } from "@/types";

interface DonutArcProps {
  problems: Problem[];
  total: number;
}

// Draws a single SVG arc path
function describeArc(
  cx: number, cy: number, r: number,
  startAngle: number, endAngle: number
): string {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

const CX = 80, CY = 80;
// Three concentric rings
const RINGS = [
  { key: "EASY",   label: "Easy",   r: 60, color: "#22c55e", trackColor: "#22c55e1a" },
  { key: "MEDIUM", label: "Med",    r: 46, color: "#f59e0b", trackColor: "#f59e0b1a" },
  { key: "HARD",   label: "Hard",   r: 32, color: "#ef4444", trackColor: "#ef44441a" },
] as const;

// Arc spans from -210° to 30° (240° sweep, opening at bottom-left)
const START_ANGLE = -210;
const END_ANGLE   =   30;
const SWEEP       = END_ANGLE - START_ANGLE; // 240°
const STROKE      = 9;

export function DonutArc({ problems, total }: DonutArcProps) {
  const stats = useMemo(() =>
    RINGS.map((r) => {
      const group  = problems.filter((p) => p.difficulty === r.key);
      const solved = group.filter((p) => p.is_solved).length;
      return { ...r, solved, total: group.length };
    }),
  [problems]);

  const totalSolved = problems.filter((p) => p.is_solved).length;
  const pct = total ? Math.round((totalSolved / total) * 100) : 0;

  return (
    <div className="flex items-center gap-6 shrink-0">
      {/* SVG arc chart */}
      <div className="relative w-[160px] h-[160px] shrink-0">
        <svg viewBox="0 0 160 160" className="w-full h-full" style={{ overflow: "visible" }}>
          <defs>
            {RINGS.map((ring) => (
              <filter key={ring.key} id={`glow-${ring.key}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>

          {stats.map((ring) => {
            const filledAngle = ring.total > 0
              ? (ring.solved / ring.total) * SWEEP
              : 0;
            const filledEnd = START_ANGLE + filledAngle;

            return (
              <g key={ring.key}>
                {/* Track */}
                <path
                  d={describeArc(CX, CY, ring.r, START_ANGLE, END_ANGLE)}
                  fill="none"
                  stroke={ring.trackColor}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                />
                {/* Filled */}
                {ring.solved > 0 && (
                  <path
                    d={describeArc(CX, CY, ring.r, START_ANGLE, filledEnd)}
                    fill="none"
                    stroke={ring.color}
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                    filter={`url(#glow-${ring.key})`}
                    style={{
                      strokeDasharray: `${(ring.solved / ring.total) * 2 * Math.PI * ring.r} ${2 * Math.PI * ring.r}`,
                    }}
                  />
                )}
                {/* Dot at end of filled arc (if any solved) */}
                {ring.solved > 0 && ring.solved < ring.total && (() => {
                  const toRad = (d: number) => (d * Math.PI) / 180;
                  const ex = CX + ring.r * Math.cos(toRad(filledEnd));
                  const ey = CY + ring.r * Math.sin(toRad(filledEnd));
                  return (
                    <circle cx={ex} cy={ey} r={3.5} fill={ring.color}
                      style={{ filter: `drop-shadow(0 0 4px ${ring.color})` }} />
                  );
                })()}
              </g>
            );
          })}

          {/* Center text */}
          <text x={CX} y={CY - 8} textAnchor="middle" fill="white"
            fontSize="22" fontWeight="700" fontFamily="monospace">
            {totalSolved}
          </text>
          <text x={CX} y={CY + 9} textAnchor="middle" fill="#475569"
            fontSize="9" fontFamily="monospace">
            / {total} solved
          </text>
          <text x={CX} y={CY + 21} textAnchor="middle" fill="#334155"
            fontSize="8" fontFamily="monospace" letterSpacing="2">
            {pct}%
          </text>
        </svg>
      </div>

      {/* Legend bars */}
      <div className="flex flex-col gap-3">
        {stats.map((s) => {
          const p = s.total ? Math.round((s.solved / s.total) * 100) : 0;
          return (
            <div key={s.key} className="flex items-center gap-2.5 min-w-[170px]">
              <span className="text-[11px] font-bold w-8 shrink-0" style={{ color: s.color }}>
                {s.label}
              </span>
              <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${p}%`,
                    background: s.color,
                    boxShadow: s.solved > 0 ? `0 0 5px ${s.color}99` : "none",
                  }}
                />
              </div>
              <span className="text-[11px] font-mono tabular-nums shrink-0 w-14 text-right">
                <span style={{ color: s.color }}>{s.solved}</span>
                <span className="text-slate-700">/{s.total}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}