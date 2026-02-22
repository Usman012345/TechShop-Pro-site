export const CONTACT = {
  phoneDisplay: "03289659525",
  // International format for WhatsApp (PK). Remove leading 0 and prefix country code.
  phoneE164: "923289659525",
  email: "c54003732@gmail.com",
};

// WhatsApp group invite (public link)
export const WHATSAPP_GROUP_LINK =
  "https://chat.whatsapp.com/FicksX7Z9HB7xPGJr4a6kj?mode=gi_t";
export const WHATSAPP_GROUP_QR = "/whatsapp-group-qr.png";

export function whatsappLink(message: string) {
  return `https://wa.me/${CONTACT.phoneE164}?text=${encodeURIComponent(message)}`;
}

export const site = {
  name: "TechShop Pro",
  description:
    "A one‑page, mobile‑first TechShop Pro website with category popups, branded product cards, and smooth performance — deployable on Vercel free tier.",
  // Used for metadata + sitemap.
  // ✅ Easiest option: set NEXT_PUBLIC_SITE_URL in Vercel Environment Variables.
  // ✅ If you don't set it, Vercel builds usually provide VERCEL_URL automatically.
  // Keep without trailing slash.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://example.com"),
};
