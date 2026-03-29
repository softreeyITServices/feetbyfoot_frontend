import type { CSSProperties } from "react";

/** Shorter duration = faster scroll. One announcement is quickest; each extra one adds time to read. */
export function marqueeDurationSeconds(announcementCount: number): number {
  const n = Math.max(1, Math.floor(announcementCount));
  /* 1 → 12s, 2 → 20s, 3 → 28s, … +8s per additional item (capped) */
  return Math.min(12 + (n - 1) * 8, 52);
}

type SimpleMarqueeProps = {
  text: string;
  /** Used to tune scroll speed (single = faster, many = slower). Defaults to 1. */
  announcementCount?: number;
};

export const SimpleMarquee = ({
  text,
  announcementCount = 1,
}: SimpleMarqueeProps) => {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const seconds = marqueeDurationSeconds(announcementCount);
  const trackStyle = {
    "--marquee-duration": `${seconds}s`,
  } as CSSProperties;

  /* Each segment is text + full-width tail so one loop (50% of track) scrolls ≥ viewport; text can enter from the right and clear the left. */
  const segment = (
    <>
      <span className="marquee-segment-text">{trimmed}</span>
      <span className="marquee-segment-tail" aria-hidden="true" />
    </>
  );

  return (
    <div className="marquee-container bg-yellow-400 p-4 text-xl">
      <div className="marquee-inner">
        <div className="marquee-track" style={trackStyle}>
          <span className="marquee-segment">{segment}</span>
          <span className="marquee-segment" aria-hidden="true">
            {segment}
          </span>
        </div>
      </div>
    </div>
  );
};
