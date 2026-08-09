"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bebas_Neue } from "next/font/google";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  tag?: string;
}

export default function BannerSlider({
  slides,
  autoPlayInterval = 5000,
  sideBanner,
}: {
  slides: Slide[];
  autoPlayInterval?: number;
  /** Optional vertical dismissible tab on the left edge, e.g. a discount callout */
  sideBanner?: { label: string; href?: string };
}) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tick, setTick] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoPlayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50;

  const goTo = useCallback(
    (index: number) => {
      if (animating || index === current) return;
      setCurrent(index);
      setAnimating(true);
      setProgress(0);
      setTick((t) => t + 1);
      setTimeout(() => setAnimating(false), 900);
    },
    [animating, current]
  );

  const next = useCallback(
    () => goTo((current + 1) % slides.length),
    [current, slides.length, goTo]
  );
  const prev = useCallback(
    () => goTo((current - 1 + slides.length) % slides.length),
    [current, slides.length, goTo]
  );

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      next();
    } else if (isRightSwipe) {
      prev();
    }
  };

  // Progress bar animation
  useEffect(() => {
    setProgress(0);
    if (progressRef.current) clearInterval(progressRef.current);
    const tickMs = 30;
    const steps = autoPlayInterval / tickMs;
    let step = 0;
    progressRef.current = setInterval(() => {
      step++;
      setProgress(Math.min((step / steps) * 100, 100));
    }, tickMs);
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [current, autoPlayInterval]);

  // Autoplay
  useEffect(() => {
    if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    autoPlayRef.current = setTimeout(next, autoPlayInterval);
    return () => {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    };
  }, [current, next, autoPlayInterval]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prev();
      } else if (e.key === "ArrowRight") {
        next();
      }
    };

    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("keydown", handleKeyDown);
      return () => slider.removeEventListener("keydown", handleKeyDown);
    }
  }, [prev, next]);

  if (!slides.length) return null;

  return (
    <div
      ref={sliderRef}
      className="relative w-full overflow-hidden bg-[#0a0a0a]"
      style={{
        minHeight: "clamp(280px, 50vh, 350px)",
        height: "clamp(300px, 45vw, 480px)"
      }}
      role="region"
      aria-label="Hero banner slideshow"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Vertical dismissible side tab, e.g. "LOTTERY DISCOUNT" */}
      {sideBanner && !bannerDismissed && (
        <div className="absolute left-0 top-0 z-30 flex h-full items-stretch">
          <Link
            href={sideBanner.href ?? "#"}
            className="relative flex w-9 sm:w-10 md:w-11 items-center justify-center bg-[#f5c518] text-[#0a0a0a] hover:bg-[#e0b30f] transition-colors"
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setBannerDismissed(true);
              }}
              aria-label="Dismiss banner"
              className="absolute top-2 flex h-5 w-5 items-center justify-center rounded-full text-xs leading-none hover:bg-black/10"
            >
              ×
            </button>
            <span className="whitespace-nowrap text-[10px] sm:text-[11px] font-bold tracking-widest [writing-mode:vertical-rl] rotate-180 py-8">
              {sideBanner.label}
            </span>
          </Link>
        </div>
      )}

      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-[900ms] ease-in-out ${
            i === current
              ? "opacity-100 z-10 pointer-events-auto"
              : "opacity-0 z-0 pointer-events-none"
          }`}
          aria-hidden={i !== current}
        >
          {/* Image — Ken Burns zoom on active slide */}
          <Image
            src={slide.image}
            alt={slide.title || "Banner slide"}
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover will-change-transform ${
              i === current ? "animate-[kenburns_6s_ease-out_forwards]" : ""
            }`}
          />

          {/* Cinematic dual-layer overlay - lighter on mobile */}
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background: `
                linear-gradient(
                  105deg,
                  rgba(0,0,0,0.8) 0%,
                  rgba(0,0,0,0.5) 40%,
                  rgba(0,0,0,0.15) 80%,
                  transparent 100%
                ),
                linear-gradient(
                  to top,
                  rgba(0,0,0,0.7) 0%,
                  rgba(0,0,0,0.3) 40%,
                  transparent 65%
                )
              `,
            }}
          />

          {/* Text — re-keyed on every slide change to trigger stagger animations */}
          {i === current && (
            <div
              key={tick}
              className="absolute inset-0 z-[2] flex flex-col justify-center px-6 sm:px-10 md:px-[clamp(1.5rem,5vw,5rem)] max-w-2xl"
            >
              {slide.tag && (
                <p className="flex items-center gap-2 text-[9px] sm:text-[10px] md:text-[11px] font-semibold tracking-[0.18em] uppercase text-[#f5c518] mb-2 sm:mb-3 md:mb-3.5 animate-[slideUp_0.5s_0.1s_ease_both]">
                  <span className="w-5 sm:w-6 md:w-7 h-[2px] bg-[#f5c518] rounded shrink-0" />
                  {slide.tag}
                </p>
              )}
              <h2
                className={`${bebas.className} text-[clamp(1.8rem,5vw,4.5rem)] leading-[0.95] sm:leading-[1] tracking-wider text-white mb-2 sm:mb-3 md:mb-4 uppercase animate-[slideUp_0.55s_0.22s_ease_both]`}
                style={{
                  textShadow: "0 2px 10px rgba(0,0,0,0.5)"
                }}
              >
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,1.8vw,1.05rem)] text-white/80 md:text-white/70 leading-relaxed mb-4 sm:mb-6 md:mb-8 max-w-[280px] sm:max-w-[350px] md:max-w-[400px] animate-[slideUp_0.5s_0.36s_ease_both]">
                  {slide.subtitle}
                </p>
              )}
              {slide.ctaLink && (
                <Link
                  href={slide.ctaLink}
                  className="group relative inline-flex items-center gap-2 px-4 sm:px-5 md:px-7 py-2.5 sm:py-3 md:py-3.5 border border-white/90 text-white text-[10px] sm:text-[11px] md:text-[12px] font-semibold tracking-[0.15em] uppercase w-fit overflow-hidden transition-colors duration-300 hover:text-[#0a0a0a] hover:border-[#f5c518] animate-[slideUp_0.5s_0.48s_ease_both]"
                >
                  <span className="absolute inset-0 bg-[#f5c518] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-[400ms] -z-[1]" />
                  {slide.ctaText ?? "Shop Now"}
                </Link>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Prev / Next arrows - hidden on mobile, visible on tablet+ */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-3 sm:left-4 md:left-[clamp(1rem,3vw,2.5rem)] top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center border border-white/20 bg-white/[0.08] text-white backdrop-blur-sm transition-all duration-200 hover:bg-[#f5c518] hover:border-[#f5c518] hover:text-[#0a0a0a]"
          >
            <svg width="14" height="14" className="sm:w-[16px] sm:h-[16px]" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 sm:right-4 md:right-[clamp(1rem,3vw,2.5rem)] top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center border border-white/20 bg-white/[0.08] text-white backdrop-blur-sm transition-all duration-200 hover:bg-[#f5c518] hover:border-[#f5c518] hover:text-[#0a0a0a]"
          >
            <svg width="14" height="14" className="sm:w-[16px] sm:h-[16px]" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {/* Bottom bar: pill dots + slide counter */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 md:bottom-0 left-0 right-0 z-20 flex items-center justify-center md:justify-start px-4 sm:px-6 md:px-[clamp(1.5rem,5vw,5rem)] py-3 sm:py-4 md:py-5">
          <div className="flex items-center gap-1 sm:gap-1.5" role="tablist">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                role="tab"
                aria-selected={i === current}
                aria-label={`Slide ${i + 1}`}
                className={`h-[2px] sm:h-[3px] rounded-sm border-none cursor-pointer p-0 transition-all duration-300 ${
                  i === current
                    ? "w-7 sm:w-8 md:w-10 bg-[#f5c518]"
                    : "w-4 sm:w-5 md:w-6 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Autoplay progress bar */}
      <div
        className="absolute bottom-0 left-0 h-[1px] sm:h-[2px] bg-[#f5c518] z-30 transition-[width] duration-[30ms] ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
