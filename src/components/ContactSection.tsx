import { CONTACT, whatsappLink } from "@/data/site";
import { PhoneCall, MessageCircle } from "lucide-react";

export function ContactSection() {
  return (
    <section id="contact" className="mt-12 scroll-mt-24 rounded-3xl border border-fg/10 bg-panel/45 p-6 md:p-10">
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.30em] text-gold2/80">Contact</p>
          <h2 className="mt-3 font-display text-2xl md:text-3xl">Let’s build something premium.</h2>
          <p className="mt-3 max-w-xl text-sm text-muted">
            Contact on WhatsApp or call for details. This demo is designed to show how a simple store can
            feel high‑end — with clean UI, brand-forward cards, and smooth motion.
          </p>
        </div>

        <div className="rounded-2xl border border-fg/10 bg-bg/25 p-5">
          <div className="text-xs uppercase tracking-widest text-muted">Direct</div>

          <div className="mt-3 text-sm text-fg/90">
            <span className="text-muted">Phone:</span>{" "}
            <a className="text-gold2 hover:underline" href={`tel:${CONTACT.phoneDisplay}`}>
              {CONTACT.phoneDisplay}
            </a>
          </div>

          <div className="mt-2 text-sm text-fg/90">
            <span className="text-muted">Email:</span>{" "}
            <a className="text-gold2 hover:underline" href={`mailto:${CONTACT.email}`}>
              {CONTACT.email}
            </a>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <a
              href={whatsappLink("السلام عليكم")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/30 bg-gold/15 px-5 py-3 text-sm text-gold2 shadow-gold transition hover:border-gold/50 hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>

            <a
              href={`tel:${CONTACT.phoneDisplay}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-fg/10 bg-panel/45 px-5 py-3 text-sm text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
            >
              <PhoneCall size={18} />
              Call
            </a>
          </div>

          <p className="mt-4 text-xs text-muted">
            WhatsApp opens with <span className="text-gold2">“السلام عليكم”</span> pre‑filled.
          </p>
        </div>
      </div>
    </section>
  );
}
