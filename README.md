# TechShop Pro — Premium One‑Page Storefront (Black & Gold)

A **single‑page, mobile‑first storefront** built with **Next.js (App Router) + TypeScript + Tailwind CSS**.

- **Luxury black + gold** styling
- **4‑second full‑screen intro loader** (gold particle network + smooth progress)
- **Shop by category → popup modal** with branded product cards
- **WhatsApp contact + WhatsApp group QR**
- Tuned to feel **smooth on mobile devices** (reduced heavy blur/shadows on small screens, canvas quality adapts)

This project is configured as a **static export** (`output: 'export'`) so it deploys cleanly on the **Vercel Free/Hobby tier** (and most static hosts).

---

## 1) Quick start

### Requirements
- **Node.js 18+** (recommended: Node 20)

### Install + run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

### Build + preview (production-like)

This project exports a static site to `/out`.

```bash
npm run preview
```

---

## 2) Deploy to Vercel (Free tier)

### Option A — Deploy from GitHub (recommended)
1. Push this repo to GitHub.
2. Go to Vercel → **New Project** → Import the repo.
3. Framework should auto-detect **Next.js**.
4. Click **Deploy**.

Because `next.config.mjs` uses `output: "export"`, Vercel will build a **static site** (no server functions required).

### Option B — Drag & drop the static export
1. Run:

```bash
npm run build
```

2. Upload the generated `out/` folder to any static host.

### Set your site URL (for SEO + sitemap)
In `src/data/site.ts`:
- Best: set **Environment Variable** in Vercel:
  - `NEXT_PUBLIC_SITE_URL` = `https://your-domain.com`

If you don’t set it, Vercel usually provides `VERCEL_URL` automatically and the project will still generate a valid `metadataBase` and sitemap.

---

## 3) Project structure

```
public/
  logos/                      # product watermark logos (SVG)
  whatsapp-group-qr.png       # WhatsApp group QR image
  og.png                      # OpenGraph preview image
  icon.png                    # Site icon
  techshoppro-logo.webp       # Brand logo used in the Hero heading
src/
  app/
    layout.tsx                # global layout + SEO metadata + intro splash
    page.tsx                  # home page sections
    sitemap.ts                # sitemap.xml
    robots.ts                 # robots.txt
  components/
    Hero.tsx                  # headline + CTA buttons
    NavBar.tsx                # sticky header
    ShopByCategory.tsx        # category cards + popup modal
    TrustedSupport.tsx        # support section
    ContactSection.tsx        # contact + WhatsApp group QR
    IntroSplash.tsx           # 4s loading overlay
    ParticleBackground.tsx    # gold particle network (optimized)
    ScrollProgress.tsx        # top scroll progress bar
  data/
    site.ts                   # site name, url, contact, WhatsApp settings
    shop.ts                   # categories + products
  styles/
    globals.css               # theme tokens + animations + small perf tweaks
```

---

## 4) Editing guide (how to change everything)

### A) Change the store name, SEO, and base URL
File: `src/data/site.ts`

- `site.name` → your store name
- `site.description` → used in SEO meta + social previews
- `site.url` → base URL used for `metadataBase`, `robots.txt`, and `sitemap.xml`

**Recommended:** set `NEXT_PUBLIC_SITE_URL` in Vercel instead of hardcoding.

---

### B) Update WhatsApp / phone / email
File: `src/data/site.ts`

- `CONTACT.phoneDisplay` → what you want to show on the site
- `CONTACT.phoneE164` → WhatsApp number in international format (no `+`)
- `CONTACT.email` → contact email

WhatsApp message links are built with:

```ts
whatsappLink("السلام عليكم")
```

Change the default message anywhere you see `"السلام عليكم"`.

---

### C) Update the WhatsApp group invite + QR
File: `src/data/site.ts`

- `WHATSAPP_GROUP_LINK` → your group invite link
- `WHATSAPP_GROUP_QR` → path to the QR image in `/public`

Replace the file:
- `public/whatsapp-group-qr.png`

---

### D) Add / remove categories
File: `src/data/shop.ts`

Edit the `categories` array:

```ts
export const categories: Category[] = [
  {
    id: "vpn",
    name: "VPN Services",
    description: "Privacy, secure browsing, and fast servers.",
    iconName: "Globe",
  },
];
```

Notes:
- `id` must be unique.
- `iconName` must exist in `src/components/icons.tsx`.

---

### E) Add / remove products (the popup cards)
File: `src/data/shop.ts`

Edit the `products` array:

```ts
{ 
  id: "vpn-nord", 
  name: "NordVPN", 
  categoryId: "vpn", 
  logo: "/logos/nordvpn.svg", 
  isActive: true 
},
```

- `logo` is used as a **watermark background** inside the product card.
- Put your watermark logo files in:
  - `public/logos/`

Tip: SVG works best (sharp + small file size).

---

### F) Change the big heading + place the brand logo
File: `src/components/Hero.tsx`

The heading text is:
- `{site.name} premium storefront`

The brand logo shown on the **right side of the heading** uses:

- `public/techshoppro-logo.webp`

To replace it:
1. Replace `public/techshoppro-logo.webp` with your own image (keep the same filename), **or**
2. Update the `src` in `Hero.tsx`.

---

### G) Change sections order (page layout)
File: `src/app/page.tsx`

```tsx
export default function HomePage() {
  return (
    <div className="space-y-12">
      <Hero />
      <ShopByCategory />
      <TrustedSupport />
      <ContactSection />
    </div>
  );
}
```

Reorder components, remove sections, or add your own.

---

### H) Edit the intro loading screen (duration, text, animation feel)
File: `src/components/IntroSplash.tsx`

Main controls:
- `DURATION_MS` → loader duration (currently **4000ms**)
- `TARGET_TEXT` → scrambling text that resolves (currently `TechShop.Pro`)

Particle animation controls passed into `<ParticleBackground />`:
- `minParticles`, `maxParticles`, `densityDivisor` (density)
- `maxDistance` (line connection distance)
- `speed` (movement speed)
- `glowBlur`, `lineOpacity`, `particleOpacity`

The progress bar is a GPU-friendly CSS animation:
- keyframes in `src/styles/globals.css` → `@keyframes splash-progress`

---

### I) Edit the particle network renderer (performance + look)
File: `src/components/ParticleBackground.tsx`

This component is tuned for smoothness:
- **Adaptive quality** for mobile/low-end devices (caps DPR, reduces particle counts)
- **Grid-based neighbor search** for lines (avoids expensive O(n²) loops)
- **Pre-rendered glow sprite** for dots (cheaper than per-dot shadowBlur)

If you want even more performance on weak phones:
- Reduce `maxParticles`
- Reduce `maxDistance`
- Increase `densityDivisor`
- Disable glow by passing `glow={false}`

---

### J) Change theme colors (black/gold palette)
File: `src/styles/globals.css`

The theme is driven by CSS variables:

```css
:root {
  --bg: 6 6 8;
  --panel: 14 14 18;
  --fg: 246 246 246;
  --gold: 212 175 55;
  --gold2: 255 214 102;
}
```

Change these values to re-theme the entire site.

---

## 5) Performance notes (mobile smoothness)

This repo includes a few deliberate choices to reduce mobile lag/jitter:
- The intro particle canvas **caps DPR** and reduces density on small screens.
- Expensive effects like `backdrop-blur` are limited to `sm:` and up.
- Large glows/shadows are reduced a bit on mobile in `globals.css`.
- Scroll progress bar uses `requestAnimationFrame` + direct DOM writes (no React rerender loop).

If you add new heavy effects (big blurs, large box-shadows, huge images), test on a real phone.

---

## 6) Legal / branding note

The included product logos in `public/logos/*.svg` are placeholders for a demo.
If you publish commercially, replace them with assets you have the rights to use.
