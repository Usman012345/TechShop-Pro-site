import { CONTACT, site, WHATSAPP_GROUP_LINK, whatsappLink } from "@/data/site";
import { LogoMark } from "@/components/LogoMark";

export function Footer() {
  return (
    <footer className="mt-14 border-t border-fg/10">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark className="h-8 w-8" />
              <div className="font-display text-sm tracking-[0.22em] text-gold2/90">
                {site.name}
              </div>
            </div>
          </div>

          <div className="grid gap-2 text-sm">
            <div className="text-xs uppercase tracking-widest text-muted">Sections</div>
            <a className="text-fg/80 hover:text-fg" href="#home">
              Home
            </a>
            <a className="text-fg/80 hover:text-fg" href="#categories">
              Shop by category
            </a>
            <a className="text-fg/80 hover:text-fg" href="#support">
              Support
            </a>
            <a className="text-fg/80 hover:text-fg" href="#contact">
              Contact
            </a>
          </div>

          <div className="grid gap-2 text-sm">
            <div className="text-xs uppercase tracking-widest text-muted">Contact</div>
            <a
              className="text-fg/80 hover:text-fg"
              href={whatsappLink("السلام عليكم")}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
            <a
              className="text-fg/80 hover:text-fg"
              href={WHATSAPP_GROUP_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Group
            </a>
            <a className="text-fg/80 hover:text-fg" href={`tel:${CONTACT.phoneDisplay}`}>
              Call: {CONTACT.phoneDisplay}
            </a>
            <a className="text-fg/80 hover:text-fg" href={`mailto:${CONTACT.email}`}>
              {CONTACT.email}
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-fg/10 pt-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. Personal portfolio demo.
          </p>
          <p className="max-w-xl">
            Trademarks and brand names belong to their respective owners. Replace logo assets with
            approved brand media if you plan to publish commercially.
          </p>
        </div>
      </div>
    </footer>
  );
}
