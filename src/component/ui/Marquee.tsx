import { AnnouncementService } from "@/domain/application/services/admin/announcement.service";
import type { CSSProperties } from "react";

export const Marquee = async () => {
  let announcements = [];

  try {
    announcements = await AnnouncementService.getPublic();
    console.log("annnoun", announcements)
  } catch {
    return null;
  }

  const messages = announcements
    .map((a) => (a.message || "").trim())
    .filter(Boolean);

  if (messages.length === 0) return null;

  const duration = Math.min(12 + (messages.length - 1) * 8, 52);
  const trackStyle = { "--marquee-duration": `${duration}s` } as CSSProperties;

  const segment = (
    <>
      <span className="marquee-segment-text flex items-center gap-24">
        {messages.map((msg, i) => (
          <span key={i} className="font-bold tracking-[0.18em] uppercase whitespace-nowrap">
            {msg}
          </span>
        ))}
      </span>
      <span className="marquee-segment-tail" aria-hidden="true" />
    </>
  );

  return (
    <div className="marquee-container bg-yellow-400 py-3 text-sm">
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
