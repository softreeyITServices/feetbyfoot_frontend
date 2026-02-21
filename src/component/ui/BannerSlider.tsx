"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

/* ───────── Types ───────── */

export interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle?: string;
}

interface BannerSliderProps {
  slides: Slide[];
}

/* ───────── Component ───────── */

export default function BannerSlider({
  slides,
}: BannerSliderProps) {
  const [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <>
      <div className="bs-wrap">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`bs-slide${idx === current ? " bs-active" : ""}`}
          >
            {/* <img src={slide.image} alt={slide.title} /> */}
            <Image
              src={slide.image}
              alt={slide.title}
              width={1920}
              height={650}
              priority
            />
          </div>
        ))}

        {slides.length > 1 && (
          <div className="bs-dots bg-white p-6 rounded-tl-2xl">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                className={`bs-dot${idx === current ? " bs-dot-on" : ""}`}
                onClick={() => setCurrent(idx)}
                aria-label={`Go to ${slide.title}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
