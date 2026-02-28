"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { X, ArrowRight, ChevronLeft, ArrowUpRight, ShoppingCart, PhoneCall } from "lucide-react";
import { Icons } from "@/components/icons";
import { cn, formatPriceRs } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";
import type { Category, CategoryId, Product } from "@/types/catalog";

function availabilityLabel(p: Product) {
  switch (p.availability) {
    case "sale":
      return "On sale";
    case "limited":
      return "Limited";
    case "contact":
      return "Contact";
    case "request":
      return "On request";
    case "unavailable":
      return "Unavailable";
    case "available":
    default:
      return "Available";
  }
}


function productBadges(p: Product) {
  const raw = p as any;
  const arr = Array.isArray(raw.badges) ? (raw.badges as unknown[]) : [];
  const badges = arr
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean);

  // Backward-compat: legacy single badge field.
  if (typeof p.badge === "string" && p.badge.trim()) badges.push(p.badge.trim());

  // Deduplicate (case-insensitive)
  const seen = new Set<string>();
  return badges.filter((b) => {
    const k = b.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export type ShopByCategoryProps = {
  categories: Category[];
  products: Product[];
};

export function ShopByCategory({ categories, products }: ShopByCategoryProps) {
  const { add } = useCart();

  // Keep a live copy so the storefront reflects admin edits immediately
  // (even when navigating client-side or switching tabs).
  const [liveCategories, setLiveCategories] = useState<Category[]>(categories);
  const [liveProducts, setLiveProducts] = useState<Product[]>(products);

  const [openCategory, setOpenCategory] = useState<CategoryId | null>(null);
  const [openProductId, setOpenProductId] = useState<string | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Sync SSR/initial props → state
  useEffect(() => {
    setLiveCategories(categories);
    setLiveProducts(products);
  }, [categories, products]);

  // Fetch latest catalog on mount + whenever the tab regains focus.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/catalog", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json().catch(() => null)) as
          | { categories: Category[]; products: Product[] }
          | null;
        if (!data || cancelled) return;
        if (Array.isArray(data.categories)) setLiveCategories(data.categories);
        if (Array.isArray(data.products)) setLiveProducts(data.products);
      } catch {
        // Ignore (offline / request aborted)
      }
    }

    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const activeCategory = useMemo(
    () => liveCategories.find((c) => c.id === openCategory) ?? null,
    [openCategory, liveCategories]
  );

  const items = useMemo(() => {
    if (!openCategory) return [];
    return liveProducts
      .filter((p) => p.isActive && p.categoryId === openCategory)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [openCategory, liveProducts]);

  const activeProduct = useMemo(() => {
    if (!openProductId) return null;
    return items.find((p) => p.id === openProductId) ?? null;
  }, [openProductId, items]);

  const countByCategory = useMemo(() => {
    const m = new Map<CategoryId, number>();
    for (const p of liveProducts) {
      if (!p.isActive) continue;
      m.set(p.categoryId, (m.get(p.categoryId) ?? 0) + 1);
    }
    return (id: CategoryId) => m.get(id) ?? 0;
  }, [liveProducts]);

  // If the currently open category was deleted, close the modal.
  useEffect(() => {
    if (!openCategory) return;
    const exists = liveCategories.some((c) => c.id === openCategory);
    if (!exists) setOpenCategory(null);
  }, [liveCategories, openCategory]);

  // Reset product view when category closes/changes.
  useEffect(() => {
    if (!openCategory) setOpenProductId(null);
  }, [openCategory]);

  // If the currently open product was removed, go back.
  useEffect(() => {
    if (!openProductId) return;
    const exists = items.some((p) => p.id === openProductId);
    if (!exists) setOpenProductId(null);
  }, [items, openProductId]);

  function showToast(message: string) {
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2400);
  }

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  function handleBuy(p: Product) {
    add(p.id, 1);
    showToast("Added to cart");
  }

  function goToContact() {
    // Close overlays, then scroll.
    setOpenProductId(null);
    setOpenCategory(null);
    window.setTimeout(() => {
      const el = document.getElementById("contact");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.location.hash = "#contact";
    }, 50);
  }

  // Close on ESC + lock scroll while modal is open.
  useEffect(() => {
    if (!openCategory) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (openProductId) setOpenProductId(null);
        else setOpenCategory(null);
      }
    };
    window.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;

    // Prevent content shift on desktop when scrollbar disappears.
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;

    // Focus close button (accessibility).
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 50);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
      window.clearTimeout(t);
    };
  }, [openCategory, openProductId]);

  return (
    <section id="categories" className="mt-12 scroll-mt-24">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 className="font-display text-xl md:text-2xl">Shop by category</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Tap a category to browse products. Tap a product for full details, or hit Buy to add it
            to your cart.
          </p>
        </div>
        <a
          href="#contact"
          className="inline-flex items-center gap-2 text-sm text-gold2/80 hover:text-gold2"
        >
          Want something else? Contact <ArrowRight size={16} />
        </a>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {liveCategories.map((c) => {
          const Icon = Icons[c.iconName];
          const count = countByCategory(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setOpenCategory(c.id)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-fg/10 bg-panel/45 p-5 text-left shadow-lg sheen",
                "transition hover:-translate-y-0.5 hover:border-gold/25 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
              )}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    "radial-gradient(600px circle at 0% 0%, rgba(212,175,55,0.20), transparent 55%)",
                }}
                aria-hidden="true"
              />
              <div className="relative flex items-start gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-gold/25 bg-bg/35 text-gold2 shadow-gold">
                  <Icon size={18} />
                </span>
                <div className="min-w-0">
                  <div className="text-sm text-fg/95">{c.name}</div>
                  <div className="mt-1 text-xs text-muted">{c.description}</div>
                  <div className="mt-3 text-xs text-gold2/80">
                    <span className="inline-flex items-center gap-1">
                      {count} item{count === 1 ? "" : "s"}
                      <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal */}
      {openCategory && activeCategory ? (
        <div className="fixed inset-0 z-[80]">
          <button
            type="button"
            onClick={() => setOpenCategory(null)}
            className="absolute inset-0 bg-bg/70 sm:backdrop-blur-sm"
            aria-label="Close category popup"
          />

          <div className="relative mx-auto mt-10 w-[min(1100px,92vw)] overflow-hidden rounded-3xl border border-fg/10 bg-panel/70 shadow-2xl sm:mt-16">
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  "radial-gradient(900px circle at 20% 0%, rgba(212,175,55,0.18), transparent 60%), radial-gradient(700px circle at 80% 10%, rgba(255,214,102,0.12), transparent 55%)",
              }}
              aria-hidden="true"
            />

            <header className="relative flex items-center justify-between gap-3 border-b border-fg/10 bg-bg/35 px-5 py-4 sm:backdrop-blur">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {activeProduct ? (
                    <button
                      type="button"
                      onClick={() => setOpenProductId(null)}
                      className="inline-flex items-center gap-2 rounded-full border border-fg/10 bg-panel/40 px-3 py-1.5 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-panel/55"
                      aria-label="Back to products"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>
                  ) : (
                    <div className="text-xs uppercase tracking-[0.30em] text-muted">Category</div>
                  )}
                </div>

                <h3 className="mt-2 truncate font-display text-xl text-gold2">
                  {activeProduct ? activeProduct.name : activeCategory.name}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/cart"
                  className="inline-flex items-center gap-2 rounded-full border border-fg/10 bg-panel/40 px-4 py-2 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
                >
                  <ShoppingCart size={16} /> Cart
                </Link>

                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={() => {
                    setOpenProductId(null);
                    setOpenCategory(null);
                  }}
                  className="grid h-10 w-10 place-items-center rounded-full border border-fg/10 bg-panel/40 text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
                  aria-label="Close popup"
                >
                  <X size={18} />
                </button>
              </div>
            </header>

            <div className="relative max-h-[78svh] overflow-auto overscroll-contain p-5 [-webkit-overflow-scrolling:touch] md:p-6">
              {!activeProduct ? (
                <>
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-muted">
                      Tap a product to open details.
                    </div>
                    <Link
                      href="/cart"
                      className="inline-flex items-center gap-2 self-start rounded-full border border-gold/30 bg-gold/15 px-4 py-2 text-sm text-gold2 shadow-gold transition hover:border-gold/50 hover:bg-gold/20"
                    >
                      <ShoppingCart size={16} /> View cart
                    </Link>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((p) => {
                      const badges = productBadges(p);
                      return (
                        <article
                          key={p.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setOpenProductId(p.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setOpenProductId(p.id);
                            }
                          }}
                          className={cn(
                            "group relative cursor-pointer overflow-hidden rounded-2xl border border-fg/10 bg-bg/30 shadow-lg transition",
                            "hover:-translate-y-0.5 hover:border-gold/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
                          )}
                          aria-label={`Open ${p.name}`}
                        >
                          {/* Image */}
                          <div className="relative aspect-[16/10] overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.image ?? "/products/placeholder.png"}
                              alt={p.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/10 to-bg/85" />

                            {p.logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.logo}
                                alt=""
                                className="pointer-events-none absolute inset-0 h-full w-full object-contain p-10 opacity-15"
                                aria-hidden="true"
                                loading="lazy"
                              />
                            ) : null}

                            {/* Subtle "open" hint */}
                            <div className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-fg/10 bg-bg/45 text-fg/80 opacity-85 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:border-gold/25 group-hover:text-gold2">
                              <ArrowUpRight size={16} />
                            </div>
                          </div>

                          <div className="relative p-5">
                            <div className="font-display text-lg leading-snug">{p.name}</div>
                            {p.planLabel ? (
                              <div className="mt-1 text-xs text-muted">{p.planLabel}</div>
                            ) : null}

                            {/* Price (shown on small cards too) */}
                            <div className="mt-3 text-sm">
                              <span className="text-muted">Price:</span>{" "}
                              <span className={p.showPrice === false ? "text-muted" : "text-gold2"}>
                                {p.showPrice === false ? "Contact for price" : formatPriceRs(p.price)}
                              </span>
                            </div>

                            {/* Tags */}
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-fg/10 bg-bg/25 px-3 py-1 text-[11px] text-muted">
                                {availabilityLabel(p)}
                              </span>
                              {badges.map((b) => (
                                <span
                                  key={b}
                                  className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[11px] text-gold2/90"
                                >
                                  {b}
                                </span>
                              ))}
                            </div>

                            <div className="mt-4">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBuy(p);
                                }}
                                className={cn(
                                  "inline-flex w-full items-center justify-center gap-2 rounded-full border border-gold/30 bg-gold/15 px-4 py-2 text-sm text-gold2 shadow-gold transition hover:border-gold/50 hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80",
                                  p.availability === "unavailable" && "pointer-events-none opacity-50"
                                )}
                                aria-disabled={p.availability === "unavailable"}
                              >
                                <ShoppingCart size={18} /> Buy
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <div className="mt-6 rounded-2xl border border-fg/10 bg-bg/25 p-4 text-xs text-muted">
                    Add items to your cart, then checkout by contacting us. Prices can be negotiated.
                  </div>
                </>
              ) : (
                <div className="mx-auto grid w-full max-w-4xl gap-5">
                  <div className="grid gap-5 rounded-3xl border border-fg/10 bg-bg/30 p-5 shadow-lg md:grid-cols-[1.2fr_1fr] md:items-start md:p-6">
                    {/* Large image */}
                    <div className="relative overflow-hidden rounded-2xl border border-fg/10 bg-bg/25">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeProduct.image ?? "/products/placeholder.png"}
                        alt={activeProduct.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/10 to-bg/80" />
                    </div>

                    {/* Details */}
                    <div>
                      <div className="font-display text-2xl leading-snug">{activeProduct.name}</div>
                      {activeProduct.planLabel ? (
                        <div className="mt-1 text-sm text-muted">{activeProduct.planLabel}</div>
                      ) : null}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-fg/10 bg-bg/25 px-3 py-1 text-xs text-muted">
                          {availabilityLabel(activeProduct)}
                        </span>
                        {productBadges(activeProduct).map((b) => (
                          <span
                            key={b}
                            className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs text-gold2/90"
                          >
                            {b}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 text-sm">
                        <span className="text-muted">Price:</span>{" "}
                        <span className={activeProduct.showPrice === false ? "text-muted" : "text-gold2"}>
                          {activeProduct.showPrice === false
                            ? "Contact for price"
                            : formatPriceRs(activeProduct.price)}
                        </span>
                      </div>

                      {activeProduct.shortDescription ? (
                        <p className="mt-4 text-sm text-muted">{activeProduct.shortDescription}</p>
                      ) : null}

                      {activeProduct.features?.length ? (
                        <div className="mt-4">
                          <div className="text-xs uppercase tracking-[0.30em] text-muted">Key points</div>
                          <ul className="mt-3 space-y-2 text-sm text-muted">
                            {activeProduct.features.map((f) => (
                              <li key={f} className="flex gap-3">
                                <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold/70" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      <div className="mt-6 grid gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => handleBuy(activeProduct)}
                          className={cn(
                            "inline-flex items-center justify-center gap-2 rounded-full border border-gold/30 bg-gold/15 px-5 py-3 text-sm text-gold2 shadow-gold transition hover:border-gold/50 hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80",
                            activeProduct.availability === "unavailable" && "pointer-events-none opacity-50"
                          )}
                          aria-disabled={activeProduct.availability === "unavailable"}
                        >
                          <ShoppingCart size={18} /> Add to cart
                        </button>

                        <button
                          type="button"
                          onClick={goToContact}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-fg/10 bg-panel/45 px-5 py-3 text-sm text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
                        >
                          <PhoneCall size={18} /> Contact
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Toast */}
      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-[90] w-[min(520px,92vw)] -translate-x-1/2">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-fg/10 bg-panel/80 px-4 py-3 text-sm text-fg/90 shadow-2xl sm:backdrop-blur">
            <span>{toast}</span>
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/15 px-4 py-2 text-xs text-gold2 shadow-gold transition hover:border-gold/50 hover:bg-gold/20"
            >
              View cart <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
