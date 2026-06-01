"use client";

import React from "react";

/* =====================================================
   WaitlistForm — client component (handles onSubmit)
   ===================================================== */
export function WaitlistForm() {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
      className="relative flex items-center justify-between p-1.5 rounded-full border border-ink/10 bg-surface/30 hover:border-ink/20 focus-within:border-pop/40 focus-within:ring-4 focus-within:ring-pop/5 backdrop-blur-lg shadow-[0_8px_32px_-4px_rgba(0,0,0,0.03)] transition-all duration-300"
    >
      <div className="flex-1 flex items-center gap-3 pl-4">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-ink-muted shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M12 2a5 5 0 0 0-5 5v4h10V7a5 5 0 0 0-5-5z" />
        </svg>
        <input
          type="email"
          required
          placeholder="Ketik email kamu..."
          className="w-full bg-transparent text-[15px] outline-none text-ink placeholder:text-ink-muted/80 py-1"
        />
      </div>

      {/* Extremely detailed high-fidelity glass-glow CTA button */}
      <button
        type="submit"
        className="group relative flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-paper overflow-hidden hover:bg-pop active:scale-95 transition-all duration-300 cursor-pointer shadow-md"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        Bikin Roadmap-ku
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </form>
  );
}

function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
