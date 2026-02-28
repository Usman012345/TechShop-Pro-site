"use client";

import { site, WHATSAPP_GROUP_LINK, whatsappLink } from "@/data/site";
import { LogoMark } from "@/components/LogoMark";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { useEffect, useState } from "react";

export function NavBar() {
  const waHref = whatsappLink("السلام عليكم");
  const pathname = usePathname() || "/";
  const { count } = useCart();

  // Admin session state (1 hour cookie).
  // We fetch this so the navbar can swap "Login" → "Admin" immediately after sign-in.
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/admin/session", { cache: "no-store" });
        const data = (await res.json().catch(() => null)) as { loggedIn?: boolean } | null;
        if (cancelled) return;
        setAdminLoggedIn(Boolean(data?.loggedIn));
      } catch {
        if (cancelled) return;
        setAdminLoggedIn(false);
      }
    }

    check();
    const onFocus = () => check();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [pathname]);

  const adminHref = adminLoggedIn ? "/admin" : "/admin/login";
  const adminLabel = adminLoggedIn ? "Admin" : "Login";

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

          {/* Mobile: keep Login/Admin on the top-right */}
          <Link
            href={adminHref}
            className="inline-flex h-9 items-center justify-center rounded-full border border-fg/10 bg-panel/40 px-4 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 sm:hidden"
            aria-label={adminLoggedIn ? "Open admin panel" : "Open admin login"}
          >
            {adminLabel}
          </Link>
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

          {!isAdminRoute ? (
            <Link
              href="/cart"
              className="relative shrink-0 rounded-full border border-fg/10 bg-panel/40 px-3 py-2 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 sm:px-4 sm:text-sm"
              aria-label="Open cart"
            >
              <span className="inline-flex items-center gap-2">
                <ShoppingCart size={16} /> Cart
              </span>
              {count > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border border-gold/30 bg-gold/20 px-1 text-[10px] text-gold2 shadow-gold">
                  {count}
                </span>
              ) : null}
            </Link>
          ) : null}

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

          <Link
            href={adminHref}
            className="hidden shrink-0 rounded-full border border-fg/10 bg-panel/40 px-3 py-2 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 sm:inline-flex sm:px-4 sm:text-sm"
            aria-label={adminLoggedIn ? "Open admin panel" : "Open admin login"}
          >
            {adminLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
