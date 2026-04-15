"use client";

import { useEffect, useRef, useState } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

interface FadeInProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;        // ms
  duration?: number;     // ms
  distance?: number;     // px — how far to travel before settling
  threshold?: number;    // 0–1, how much of the element must be visible
  className?: string;
  once?: boolean;        // only animate once (default true)
}

const directionStyle: Record<Direction, string> = {
  up:    "translateY(40px)",
  down:  "translateY(-40px)",
  left:  "translateX(40px)",
  right: "translateX(-40px)",
  none:  "none",
};

export default function FadeIn({
  children,
  direction = "up",
  delay = 0,
  duration = 600,
  distance,
  threshold = 0.15,
  className,
  once = true,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const transform =
    distance !== undefined
      ? direction === "up"    ? `translateY(${distance}px)`
      : direction === "down"  ? `translateY(-${distance}px)`
      : direction === "left"  ? `translateX(${distance}px)`
      : direction === "right" ? `translateX(-${distance}px)`
      : "none"
      : directionStyle[direction];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : transform,
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
