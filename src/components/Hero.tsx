import { site, whatsappLink } from "@/data/site";

export function Hero() {
  const waHref = whatsappLink("السلام عليكم");

  return (
    <section
      id="home"
      className="relative scroll-mt-24 overflow-hidden rounded-3xl border border-fg/10 bg-panel/60 p-8 shadow-2xl md:p-12"
    >
      {/* Gold light fields (CSS only, GPU-friendly) */}
      <div
        className="pointer-events-none absolute inset-0 bg-gold-glow opacity-80"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-24 -right-32 hidden h-80 w-80 rounded-full bg-gold/20 blur-3xl animate-floatSlow sm:block"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-28 -left-36 hidden h-96 w-96 rounded-full bg-gold2/10 blur-3xl animate-floatSlow2 sm:block"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-hero-sheen opacity-35 blur-2xl" />

      <div className="relative max-w-3xl">
        <p className="text-xs uppercase tracking-[0.30em] text-gold2/80">
          Built to wow customers • Black & Gold • Smooth on every device
        </p>

        <h1 className="mt-4 font-display text-3xl leading-tight md:text-5xl">
          {site.name}{" "}
          <span className="bg-gradient-to-r from-gold2 to-gold bg-clip-text text-transparent">
            premium storefront demo
          </span>{" "}
          for modern digital shops.
        </h1>

        <p className="mt-4 text-sm text-muted md:text-base">
          A one‑page experience with category popups, branded product cards, and performance‑safe visuals —
          perfect for showcasing your web design skills to real clients.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#categories"
            className="inline-flex items-center justify-center rounded-full border border-gold/30 bg-gold/15 px-5 py-3 text-sm text-gold2 shadow-gold transition hover:border-gold/50 hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80"
          >
            Browse categories
          </a>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-fg/10 bg-panel/45 px-5 py-3 text-sm text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
          >
            Contact on WhatsApp
          </a>

          <a
            href="#contact"
            className="inline-flex items-center justify-center rounded-full px-2 py-3 text-sm text-gold2/80 underline decoration-gold/40 underline-offset-4 hover:text-gold2"
          >
            or jump to contact
          </a>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-full border border-fg/10 bg-bg/35 px-3 py-1">Responsive</span>
          <span className="rounded-full border border-fg/10 bg-bg/35 px-3 py-1">One-page</span>
          <span className="rounded-full border border-fg/10 bg-bg/35 px-3 py-1">Vercel-ready</span>
          <span className="rounded-full border border-fg/10 bg-bg/35 px-3 py-1">No price clutter</span>
        </div>
      </div>
    </section>
  );
}
