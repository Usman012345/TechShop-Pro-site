import { CONTACT, whatsappLink } from "@/data/site";
import { PhoneCall, Mail, MessageCircle } from "lucide-react";

export function TrustedSupport() {
  return (
    <section
      id="support"
      className="mt-12 scroll-mt-24 rounded-3xl border border-fg/10 bg-panel/45 p-6 md:p-8"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-xl md:text-2xl">Trusted support</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Fast responses and clear communication — WhatsApp for quick chats, or call for details.
          </p>
        </div>
        <div className="text-xs uppercase tracking-[0.30em] text-gold2/70">
          Responsive • Clean • Premium
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <a
          href={whatsappLink("السلام عليكم")}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-2xl border border-gold/25 bg-bg/25 p-5 shadow-gold transition hover:border-gold/45"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-gold/25 bg-bg/35 text-gold2 shadow-gold">
              <MessageCircle size={18} />
            </span>
            <div>
              <div className="text-sm text-fg/95">WhatsApp</div>
              <div className="text-xs text-muted">Open chat →</div>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted">
            Best for quick questions, screenshots, and plan selection.
          </p>
        </a>

        <a
          href={`tel:${CONTACT.phoneDisplay}`}
          className="group rounded-2xl border border-fg/10 bg-bg/25 p-5 transition hover:border-fg/20"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-fg/10 bg-bg/35 text-fg/90">
              <PhoneCall size={18} />
            </span>
            <div>
              <div className="text-sm text-fg/95">Call</div>
              <div className="text-xs text-muted">{CONTACT.phoneDisplay}</div>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted">
            Prefer voice? Call for availability and details.
          </p>
        </a>

        <a
          href={`mailto:${CONTACT.email}`}
          className="group rounded-2xl border border-fg/10 bg-bg/25 p-5 transition hover:border-fg/20"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-fg/10 bg-bg/35 text-fg/90">
              <Mail size={18} />
            </span>
            <div>
              <div className="text-sm text-fg/95">Email</div>
              <div className="text-xs text-muted">{CONTACT.email}</div>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted">
            For longer messages or formal communication.
          </p>
        </a>
      </div>
    </section>
  );
}
