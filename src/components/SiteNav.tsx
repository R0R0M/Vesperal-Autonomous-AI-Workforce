"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import Wordmark from "./Wordmark";

const ITEMS = [
  ["roster", "Roster"],
  ["workflow", "Workflow"],
  ["dashboard", "Dashboard"],
  ["pricing", "Pricing"],
] as const;

/** Marketing nav: section links with active state, theme toggle, sign-in, mobile menu. */
export default function SiteNav() {
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sections = ITEMS.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (sections.length === 0 || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.1, 0.5] },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-page items-center justify-between px-5 sm:px-8">
        <Wordmark small />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Sections">
          {ITEMS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? "true" : undefined}
              className={`rounded-md px-3 py-1.5 text-[13px] transition-colors ${
                active === id ? "bg-paper-2 text-ink" : "text-ink-2 hover:text-ink"
              }`}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="btn-primary btn-sm hidden sm:inline-flex">
            Sign in
          </Link>
          <button
            type="button"
            className="btn-ghost btn-sm md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              {open ? <path d="M3 3l10 10M13 3L3 13" /> : <path d="M2 4.5h12M2 8h12M2 11.5h12" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-rule bg-paper md:hidden">
          <nav className="mx-auto flex max-w-page flex-col px-5 py-3 sm:px-8" aria-label="Sections">
            {ITEMS.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-[15px] text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
              >
                {label}
              </a>
            ))}
            <Link href="/login" className="btn-primary mt-3 sm:hidden" onClick={() => setOpen(false)}>
              Sign in with GitHub
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
