export const CONTACT = {
  phoneDisplay: "03289659525",
  // International format for WhatsApp (PK). Remove leading 0 and prefix country code.
  phoneE164: "923289659525",
  email: "c54003732@gmail.com",
};

export function whatsappLink(message: string) {
  return `https://wa.me/${CONTACT.phoneE164}?text=${encodeURIComponent(message)}`;
}

export const site = {
  name: "TechShop Pro",
  tagline:
    "A cinematic black & gold storefront demo — designed to wow customers and showcase premium UI.",
  description:
    "A one‑page, mobile‑first TechShop Pro demo with category popups, branded product cards, and smooth performance — deployable on Vercel free tier.",
  // Replace after deploy (used for metadata + sitemap). Keep without trailing slash.
  url: "https://example.com",
};
