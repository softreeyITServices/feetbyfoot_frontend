"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

/* ───────── Types ───────── */

export interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface BannerSliderProps {
  slides: Slide[];
}

/* ───────── Component ───────── */

export default function BannerSlider({ slides }: BannerSliderProps) {
  const [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="bs-wrap">
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`bs-slide${idx === current ? " bs-active" : ""}`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            sizes="90vw"
            priority={idx === 0}
            className="object-stretch"
          />

          {/* Dark gradient overlay */}
          <div className="bs-overlay" />

          {/* Text content */}
          <div className="bs-content">
            {slide.title && (
              <h1 className="bs-title">{slide.title}</h1>
            )}
            {slide.subtitle && (
              <p className="bs-subtitle">{slide.subtitle}</p>
            )}
            {slide.ctaText && slide.ctaLink && (
              <Link href={slide.ctaLink} className="bs-cta">
                {slide.ctaText}
              </Link>
            )}
          </div>
        </div>
      ))}

      {/* Dot navigation — bottom center */}
      {slides.length > 1 && (
        <div className="bs-dots">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              className={`bs-dot${idx === current ? " bs-dot-on" : ""}`}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
