"use client";

import { useEffect, useRef } from "react";

/**
 * ChromeCursor — binds mouse position to CSS variables --mx / --my (0..100)
 * on the target ref. Used by /v3 hero for the iridescent spotlight.
 */
export function ChromeCursor({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let targetX = 50;
    let targetY = 35;
    let curX = 50;
    let curY = 35;

    const tick = () => {
      curX += (targetX - curX) * 0.12;
      curY += (targetY - curY) * 0.12;
      el.style.setProperty("--mx", curX.toFixed(2));
      el.style.setProperty("--my", curY.toFixed(2));
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width) * 100;
      targetY = ((e.clientY - rect.top) / rect.height) * 100;
    };

    if (!reduce) {
      el.addEventListener("mousemove", onMove);
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div ref={ref} className="chr-spot relative">
      {children}
    </div>
  );
}
