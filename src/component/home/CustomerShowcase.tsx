"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { showcaseService } from "@/domain/application/services/showcase.service";
import { Showcase } from "@/domain/shared/types/showcase.type";

export default function CustomerShowcase() {
  const [items, setItems] = useState<Showcase[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchShowcases = async () => {
      try {
        const data = await showcaseService.getActiveShowcases();
        if (!data?.length) return;
        setItems(data);
      } catch {
        // Silently ignore — backend may be down or returning 404
      }
    };
    fetchShowcases();
  }, []);

  const scrollByAmount = useCallback((direction: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.clientWidth ?? 260;
    el.scrollBy({ left: direction * (cardWidth + 16), behavior: "smooth" });
  }, []);

  if (!items.length) return null;

  return (
    <section className="w-full py-6 sm:py-8 md:py-10 bg-neutral-50">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-neutral-800">
          100,000+ Happy Customers
        </h2>
      </div>

      <div className="relative px-2 sm:px-4">
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-2 sm:px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => {
            const card = (
              <div className="relative w-[46vw] sm:w-[220px] md:w-[240px] aspect-[3/4] shrink-0 snap-start overflow-hidden rounded-lg sm:rounded-xl bg-black">
                {item.mediaType === "video" ? (
                  <video
                    src={item.mediaUrl}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <Image
                    src={item.mediaUrl}
                    alt={item.caption}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 46vw, 240px"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <p className="absolute bottom-3 left-3 right-3 text-white text-xs sm:text-sm font-medium leading-snug">
                  {item.caption}
                </p>
              </div>
            );

            return item.ctaLink ? (
              <Link key={item._id} href={item.ctaLink}>
                {card}
              </Link>
            ) : (
              <div key={item._id}>{card}</div>
            );
          })}
        </div>

        {items.length > 2 && (
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            aria-label="Scroll showcase right"
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-white shadow-md border border-neutral-200 hover:bg-neutral-100 transition"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}
