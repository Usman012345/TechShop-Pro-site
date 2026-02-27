"use client";

import { site, WHATSAPP_GROUP_LINK, whatsappLink } from "@/data/site";
import { LogoMark } from "@/components/LogoMark";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavBar() {
  const waHref = whatsappLink("السلام عليكم");
  const pathname = usePathname() || "/";

  // Requirement:
  // - On the public storefront (home, etc.): show Login
  // - On the admin panel: show Logout
  // (We intentionally do NOT base this on cookies so home always shows Login.)
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname.startsWith("/admin/login");
  const showLogout = isAdminRoute && !isAdminLogin;

  return (
    <header className="sticky top-0 z-50 border-b border-fg/10 bg-bg/90 sm:bg-bg/75 sm:backdrop-blur sm:supports-[backdrop-filter]:bg-bg/45">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/#home" className="inline-flex items-center gap-3">
            <LogoMark />
            <div className="font-display text-[11px] tracking-[0.22em] text-gold2/90 sm:text-sm">
              {site.name}
            </div>
          </Link>

          {/* Mobile: keep Login/Logout on the top-right */}
          {showLogout ? (
            <form action="/api/admin/logout" method="post" className="sm:hidden">
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-full border border-fg/10 bg-panel/40 px-4 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
                aria-label="Logout admin"
              >
                Logout
              </button>
            </form>
          ) : (
            <Link
              href="/admin/login"
              className="inline-flex h-9 items-center justify-center rounded-full border border-fg/10 bg-panel/40 px-4 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 sm:hidden"
              aria-label="Open admin login"
            >
              Login
            </Link>
          )}
        </div>

        <div className="no-scrollbar mt-3 flex w-full items-center gap-2 overflow-x-auto whitespace-nowrap py-1 [-webkit-overflow-scrolling:touch] sm:mt-0 sm:w-auto sm:flex-wrap sm:justify-end sm:overflow-visible">
          <Link
            href="/#categories"
            className="shrink-0 rounded-full border border-fg/10 bg-panel/40 px-3 py-2 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 sm:px-4 sm:text-sm"
          >
            Browse
          </Link>

          <Link
            href="/#contact"
            className="shrink-0 rounded-full border border-fg/10 bg-panel/40 px-3 py-2 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 sm:px-4 sm:text-sm"
          >
            Contact
          </Link>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full border border-gold/30 bg-gold/15 px-3 py-2 text-xs text-gold2 shadow-gold transition hover:border-gold/50 hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 sm:px-4 sm:text-sm"
            aria-label="Open WhatsApp chat"
          >
            WhatsApp
          </a>

          <a
            href={WHATSAPP_GROUP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full border border-fg/10 bg-panel/40 px-3 py-2 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 sm:px-4 sm:text-sm"
            aria-label="Open WhatsApp group"
          >
            WhatsApp Group
          </a>

          {showLogout ? (
            <form action="/api/admin/logout" method="post" className="hidden sm:inline-flex">
              <button
                type="submit"
                className="shrink-0 rounded-full border border-fg/10 bg-panel/40 px-3 py-2 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 sm:px-4 sm:text-sm"
                aria-label="Logout admin"
              >
                Logout
              </button>
            </form>
          ) : (
            <Link
              href="/admin/login"
              className="hidden shrink-0 rounded-full border border-fg/10 bg-panel/40 px-3 py-2 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 sm:inline-flex sm:px-4 sm:text-sm"
              aria-label="Open admin login"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
