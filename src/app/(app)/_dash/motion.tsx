"use client";

/**
 * Motion kit — isolated client leaves untuk dashboard.
 * Spring physics (bukan linear), stagger orchestration parent+child
 * dalam satu client tree, dan degradasi penuh saat reduced-motion.
 */
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { useEffect, useRef } from "react";

const SPRING = { type: "spring", stiffness: 100, damping: 20 } as const;

const groupVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: SPRING },
};

/** Parent stagger — anak-anaknya (StaggerItem) muncul berurutan. */
export function StaggerGroup({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <section className={className}>{children}</section>;
  return (
    <motion.section
      className={className}
      variants={groupVariants}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.section>
  );
}

export function StaggerItem({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

/** Angka KPI yang naik dengan spring saat mount. Fallback: angka statis. */
export function CountUp({
  to,
  className,
}: {
  to: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 80, damping: 22 });
  const rounded = useTransform(spring, (v) => Math.round(v).toString());
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduce) return;
    mv.set(to);
    const unsub = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = v;
    });
    return unsub;
  }, [to, mv, rounded, reduce]);

  return (
    <span ref={ref} className={className}>
      {reduce ? to : 0}
    </span>
  );
}

/** Ring readiness yang menggambar dirinya saat mount (stroke draw-on). */
export function RingProgress({
  score,
  r = 54,
  strokeWidth = 10,
}: {
  score: number;
  r?: number;
  strokeWidth?: number;
}) {
  const reduce = useReducedMotion();
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
      <defs>
        <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--act-sky-bright)" />
          <stop offset="100%" stopColor="var(--act-sky-deep)" />
        </linearGradient>
      </defs>
      <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(15,23,42,0.08)" strokeWidth={strokeWidth} />
      {reduce ? (
        <circle
          cx="64" cy="64" r={r} fill="none" stroke="url(#ring)"
          strokeWidth={strokeWidth} strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
        />
      ) : (
        <motion.circle
          cx="64" cy="64" r={r} fill="none" stroke="url(#ring)"
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - dash }}
          transition={{ type: "spring", stiffness: 50, damping: 18, delay: 0.2 }}
        />
      )}
    </svg>
  );
}
