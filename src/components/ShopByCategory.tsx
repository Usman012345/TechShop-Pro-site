"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { whatsappLink } from "@/data/site";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { Category, CategoryId, Product } from "@/types/catalog";

function productMessage(p: Product) {
  const plan = p.planLabel ? `\nPlan: ${p.planLabel}` : "";
  const price = p.priceLabel ? `\nPrice: ${p.priceLabel}` : "";
  return `السلام عليكم\n\nI'm interested in:\n${p.name}${plan}${price}\n\nSent from TechShop Pro website.`;
}

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

function badgeText(p: Product) {
  if (p.badge) return p.badge;
  if (p.availability === "sale") return "Sale";
  if (p.availability === "limited") return "Limited";
  if (p.availability === "unavailable") return "Unavailable";
  return undefined;
}

export type ShopByCategoryProps = {
  categories: Category[];
  products: Product[];
};

export function ShopByCategory({ categories, products }: ShopByCategoryProps) {
  const [openCategory, setOpenCategory] = useState<CategoryId | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === openCategory) ?? null,
    [openCategory, categories]
  );

  const items = useMemo(() => {
    if (!openCategory) return [];
    return products
      .filter((p) => p.isActive && p.categoryId === openCategory)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [openCategory, products]);

  const countByCategory = useMemo(() => {
    const m = new Map<CategoryId, number>();
    for (const p of products) {
      if (!p.isActive) continue;
      m.set(p.categoryId, (m.get(p.categoryId) ?? 0) + 1);
    }
    return (id: CategoryId) => m.get(id) ?? 0;
  }, [products]);

  // Close on ESC + lock scroll while modal is open.
  useEffect(() => {
    if (!openCategory) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenCategory(null);
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
  }, [openCategory]);

  return (
    <section id="categories" className="mt-12 scroll-mt-24">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 className="font-display text-xl md:text-2xl">Shop by category</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Tap a category to open a clean popup with product cards — images, quick details, and a
            contact CTA.
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
        {categories.map((c) => {
          const Icon = Icons[c.iconName];
          const count = countByCategory(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setOpenCategory(c.id)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-fg/10 bg-panel/45 p-5 text-left shadow-lg sheen",
                "transition hover:border-gold/25 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
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
                    {count} item{count === 1 ? "" : "s"} →
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
                <div className="text-xs uppercase tracking-[0.30em] text-muted">Category</div>
                <h3 className="mt-1 truncate font-display text-xl text-gold2">
                  {activeCategory.name}
                </h3>
              </div>

              <button
                ref={closeBtnRef}
                type="button"
                onClick={() => setOpenCategory(null)}
                className="grid h-10 w-10 place-items-center rounded-full border border-fg/10 bg-panel/40 text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
                aria-label="Close popup"
              >
                <X size={18} />
              </button>
            </header>

            <div className="relative max-h-[78svh] overflow-auto overscroll-contain p-5 [-webkit-overflow-scrolling:touch] md:p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <article
                    key={p.id}
                    className="group relative overflow-hidden rounded-2xl border border-fg/10 bg-bg/30 shadow-lg transition hover:border-gold/25"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={p.image ?? "/products/placeholder.png"}
                        alt={p.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/15 to-bg/85" />

                      {p.logo ? (
                        <img
                          src={p.logo}
                          alt=""
                          className="pointer-events-none absolute inset-0 h-full w-full object-contain p-10 opacity-15"
                          aria-hidden="true"
                          loading="lazy"
                        />
                      ) : null}

                      {badgeText(p) ? (
                        <div className="absolute left-3 top-3 rounded-full border border-gold/30 bg-bg/55 px-3 py-1 text-[11px] tracking-wide text-gold2 sm:backdrop-blur">
                          {badgeText(p)}
                        </div>
                      ) : null}
                    </div>

                    <div className="relative p-5">
                      <div className="font-display text-lg leading-snug">{p.name}</div>

                      {p.planLabel || p.shortDescription ? (
                        <div className="mt-1 text-xs text-muted">
                          {p.planLabel ?? p.shortDescription}
                        </div>
                      ) : null}

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="text-sm text-gold2">{p.priceLabel ?? "Contact"}</div>
                        <div className="text-xs text-muted">{availabilityLabel(p)}</div>
                      </div>

                      {p.features?.length ? (
                        <ul className="mt-3 space-y-1 text-xs text-muted">
                          {p.features.slice(0, 3).map((f) => (
                            <li key={f} className="flex gap-2">
                              <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-gold/70" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      <div className="mt-4">
                        <a
                          href={whatsappLink(productMessage(p))}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "inline-flex w-full items-center justify-center rounded-full border border-gold/30 bg-gold/15 px-4 py-2 text-sm text-gold2 shadow-gold transition hover:border-gold/50 hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80",
                            p.availability === "unavailable" && "pointer-events-none opacity-50"
                          )}
                          aria-disabled={p.availability === "unavailable"}
                        >
                          Contact
                        </a>
                        <div className="mt-2 text-center text-[11px] text-muted">
                          Opens WhatsApp
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-fg/10 bg-bg/25 p-4 text-xs text-muted">
                No checkout on this site.
                Tap <span className="text-gold2">Contact</span> to open WhatsApp for an inquiry.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
