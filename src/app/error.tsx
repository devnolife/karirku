"use client";

import { ErrorPanel } from "@/components/ErrorPanel";

/* Root boundary — catches failures on the landing page and any route
   without a closer error.tsx. Wraps the panel in the app canvas since
   no shell layout is rendered here. */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="app-canvas act-sans flex min-h-[100dvh] items-center justify-center text-[var(--act-ink)]">
      <ErrorPanel error={error} reset={reset} homeHref="/" homeLabel="Ke beranda" />
    </main>
  );
}
