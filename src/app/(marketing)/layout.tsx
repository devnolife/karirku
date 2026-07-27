import Link from "next/link";
import type { ReactNode } from "react";
import { SITE } from "@/lib/site";

function ArrowLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function BrandMark() {
  return (
    <span className="flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        className="h-8 w-auto"
      >
        <rect width="48" height="48" rx="12" fill="#042718" />
        <path
          d="M14 34V14M14 24c6.5-9.5 16.5-9.5 22 0"
          stroke="#ffffff"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-onest text-xl font-semibold tracking-tight text-[#042718]">
        {SITE.name}
      </span>
    </span>
  );
}

const footerLinks = [
  { label: "Tentang", href: "/about" },
  { label: "Karir", href: "/careers" },
  { label: "Kontak", href: "/contact" },
  { label: "Syarat & Ketentuan", href: "/terms" },
  { label: "Kebijakan Privasi", href: "/privacy" },
];

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-white font-inter text-[#042718] flex flex-col">
      <header className="w-full border-b border-[#042718]/10">
        <div className="mx-auto flex w-full max-w-[1248px] items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <BrandMark />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden items-center gap-2 rounded-full border border-[#042718]/10 px-4 py-2 text-[15px] font-medium transition-colors hover:bg-[#F6FDFF] sm:inline-flex"
            >
              <ArrowLeftIcon />
              Beranda
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-full bg-[#042718] px-5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-[#063b25]"
            >
              Mulai Gratis
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[860px] px-6 py-14 lg:px-8 lg:py-20">{children}</div>
      </main>

      <footer className="w-full border-t border-[#042718]/10">
        <div className="mx-auto flex w-full max-w-[1248px] flex-col gap-4 px-6 py-8 text-[15px] lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <nav className="flex flex-wrap gap-x-6 gap-y-2 opacity-80">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:opacity-100 hover:underline">
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="opacity-60">
            &copy; {new Date().getFullYear()} {SITE.name}. Hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
