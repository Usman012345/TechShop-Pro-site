import { site, WHATSAPP_GROUP_LINK, whatsappLink } from "@/data/site";
import { LogoMark } from "@/components/LogoMark";

export function NavBar() {
  const waHref = whatsappLink("السلام عليكم");

  return (
    <header className="sticky top-0 z-50 border-b border-fg/10 bg-bg/90 sm:bg-bg/75 sm:backdrop-blur sm:supports-[backdrop-filter]:bg-bg/45">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <a href="#home" className="inline-flex items-center gap-3">
          <LogoMark />
          <div className="font-display text-[11px] tracking-[0.22em] text-gold2/90 sm:text-sm">
            {site.name}
          </div>
        </a>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <a
            href="#categories"
            className="rounded-full border border-fg/10 bg-panel/40 px-3 py-2 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 sm:px-4 sm:text-sm"
          >
            Browse
          </a>

          <a
            href="#contact"
            className="rounded-full border border-fg/10 bg-panel/40 px-3 py-2 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 sm:px-4 sm:text-sm"
          >
            Contact
          </a>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-gold/30 bg-gold/15 px-3 py-2 text-xs text-gold2 shadow-gold transition hover:border-gold/50 hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 sm:px-4 sm:text-sm"
            aria-label="Open WhatsApp chat"
          >
            WhatsApp
          </a>

          <a
            href={WHATSAPP_GROUP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-fg/10 bg-panel/40 px-3 py-2 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 sm:px-4 sm:text-sm"
            aria-label="Open WhatsApp group"
          >
            WhatsApp Group
          </a>
        </div>
      </div>
    </header>
  );
}
