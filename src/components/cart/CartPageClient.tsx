"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Trash2, ArrowLeft, PhoneCall } from "lucide-react";
import { cn, formatPriceRs } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";
import type { Product } from "@/types/catalog";

type PublicCatalog = {
  categories: any[];
  products: Product[];
};

function QtyInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  const [raw, setRaw] = useState<string>(String(value));

  useEffect(() => {
    setRaw(String(value));
  }, [value]);

  return (
    <input
      type="text"
      inputMode="numeric"
      value={raw}
      onChange={(e) => {
        const v = e.target.value;
        if (!/^\d*$/.test(v)) return;
        setRaw(v);
        if (v === "") return;
        const n = Number(v);
        if (Number.isFinite(n)) onChange(n);
      }}
      onBlur={() => {
        const n = Number(raw);
        if (!Number.isFinite(n) || n <= 0) {
          setRaw("1");
          onChange(1);
          return;
        }
        setRaw(String(Math.floor(n)));
        onChange(Math.floor(n));
      }}
      className="h-10 w-16 rounded-xl border border-fg/10 bg-bg/35 px-3 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
      aria-label="Quantity"
    />
  );
}

export function CartPageClient() {
  const { items, setQty, remove, clear } = useCart();
  const [catalog, setCatalog] = useState<PublicCatalog | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/catalog", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json().catch(() => null)) as PublicCatalog | null;
        if (!data || cancelled) return;
        setCatalog(data);
      } catch {
        // ignore
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

  const productsById = useMemo(() => {
    const m = new Map<string, Product>();
    for (const p of catalog?.products ?? []) m.set(p.id, p);
    return m;
  }, [catalog?.products]);

  const rows = useMemo(() => {
    return items
      .map((it) => {
        const p = productsById.get(it.productId);
        const price = typeof p?.price === "number" && Number.isFinite(p.price) ? p.price : 0;
        const name = p?.name ?? "Unknown product";
        const plan = p?.planLabel ?? "";
        const image = p?.image ?? "/products/placeholder.png";
        return {
          productId: it.productId,
          qty: it.qty,
          price,
          name,
          plan,
          image,
          lineTotal: price * it.qty,
          missing: !p,
        };
      })
      .filter((x) => x.qty > 0);
  }, [items, productsById]);

  const total = useMemo(() => rows.reduce((sum, r) => sum + r.lineTotal, 0), [rows]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.30em] text-muted">
            <ShoppingCart size={16} /> Cart
          </div>
          <h1 className="mt-2 font-display text-2xl md:text-3xl">Your cart</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Review your items. Checkout is done by contacting us — prices can be negotiated.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/#categories"
            className="inline-flex items-center gap-2 rounded-full border border-fg/10 bg-panel/40 px-4 py-2 text-sm text-fg/90 transition hover:border-fg/20 hover:bg-panel/55"
          >
            <ArrowLeft size={16} /> Continue shopping
          </Link>
          <button
            type="button"
            onClick={() => {
              if (items.length === 0) return;
              const ok = confirm("Clear your cart?");
              if (ok) clear();
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-fg/10 bg-panel/40 px-4 py-2 text-sm text-fg/90 transition hover:border-fg/20 hover:bg-panel/55",
              items.length === 0 && "opacity-50"
            )}
            disabled={items.length === 0}
          >
            <Trash2 size={16} /> Clear
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-3xl border border-fg/10 bg-panel/45 p-6">
          <div className="font-display text-lg">Cart is empty</div>
          <p className="mt-2 text-sm text-muted">Add items from the Browse section.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rows.map((r) => (
            <div
              key={r.productId}
              className="grid gap-3 rounded-3xl border border-fg/10 bg-panel/45 p-4 sm:grid-cols-[120px_1fr_auto] sm:items-center"
            >
              {/* Image */}
              <div className="h-[86px] overflow-hidden rounded-2xl border border-fg/10 bg-bg/25 sm:h-[96px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.image} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>

              {/* Info */}
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-display text-lg">{r.name}</div>
                    {r.plan ? <div className="mt-1 text-xs text-muted">{r.plan}</div> : null}
                    {r.missing ? (
                      <div className="mt-2 text-xs text-red-200">
                        This item is no longer available in the catalog. You can remove it.
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(r.productId)}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-fg/10 bg-bg/30 px-4 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-bg/40"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="text-sm text-muted">
                    Price: <span className="text-gold2">{formatPriceRs(r.price)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted">Qty</span>
                    <QtyInput value={r.qty} onChange={(n) => setQty(r.productId, n)} />
                  </div>

                  <div className="ml-auto text-sm text-muted">
                    Line: <span className="text-gold2">{formatPriceRs(r.lineTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Checkout */}
      <div className="rounded-3xl border border-gold/25 bg-gold/10 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.30em] text-gold2/80">Checkout</div>
            <div className="mt-2 font-display text-2xl text-gold2">{formatPriceRs(total)}</div>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Note: The price can be negotiated. Contact us to confirm availability and your final deal.
            </p>
          </div>

          <Link
            href="/#contact"
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full border border-gold/30 bg-gold/15 px-6 py-3 text-sm text-gold2 shadow-gold transition hover:border-gold/50 hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80",
              rows.length === 0 && "pointer-events-none opacity-50"
            )}
            aria-disabled={rows.length === 0}
          >
            <PhoneCall size={18} /> Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
