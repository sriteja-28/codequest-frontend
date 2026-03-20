"use client";
import type { AdPlacement } from "@/types";

interface Props { placements: AdPlacement[]; position: string; }

export default function AdSlot({ placements, position }: Props) {
  const slot = placements.find((p) => p.position === position);
  if (!slot || slot.creatives.length === 0) return null;
  const creative = slot.creatives[0];

  return (
    <div className="ad-slot">
      {creative.html_snippet
        ? <div dangerouslySetInnerHTML={{ __html: creative.html_snippet }} />
        : creative.image_url
          ? <a href={creative.link_url || "#"} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={creative.image_url} alt="Ad" className="w-full rounded-xl" />
            </a>
          : null}
      <p className="text-center text-slate-600 text-[10px] mt-1">Advertisement</p>
    </div>
  );
}