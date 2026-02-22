# TechShop Pro — Software Tools Shop (Next.js + Tailwind)

Showcase storefront built with:

- **Next.js (App Router) + TypeScript + Tailwind CSS**
- **Luxury black + gold** UI
- **4‑second full‑screen intro loader** (particle network + progress)
- **Shop by category → popup modal** with **product cards (image + details + contact CTA)**
- **Contact-only flow** (no checkout / no payments)

✅ Designed to deploy on **Vercel Free/Hobby tier**.

---

## Quick start

### Requirements

- Node.js 18+ (Node 20 recommended)

### Install + run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

### Production-like preview

```bash
npm run preview
```

---

## Deploy to Vercel

1. Push this repository to GitHub.
2. Vercel → **New Project** → Import.
3. Framework should auto-detect **Next.js**.
4. Deploy.

This repo includes API routes and an admin panel, so it deploys as a normal Next.js app.

---

## Admin panel

- URL: `/admin`
- Login: `/admin/login`

Environment variables (recommended on Vercel):

- `ADMIN_PASSWORD` — admin login password
- `ADMIN_SESSION_SECRET` — cookie signing secret

Local dev defaults:

- If `ADMIN_PASSWORD` is not set, it defaults to: `techshoppro`

### Persistent catalog storage (recommended for Vercel)

This project supports **persistent catalog storage** on serverless hosting via a connectionless REST
KV store:

**Option A — Vercel KV** (recommended if you want everything inside Vercel)

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

**Option B — Upstash Redis REST**

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Optional:

- `TECHSHOP_CATALOG_KEY` (default: `techshoppro:catalog:v1`)

If no KV environment variables are set, the catalog falls back to **in-memory** storage (useful for
local development, but not persistent on Vercel).

---

## Editing the catalog

Seed data lives in:

- `src/data/catalogSeed.ts`

Public storefront reads from a server-side catalog store seeded by that file:

- `src/lib/catalogStore.ts`

Images live in:

- `public/products/`

If a product has no image, it falls back to:

- `/products/placeholder.png`

---

## Project structure

```
public/
  products/                  # product card images
  logos/                     # (optional) watermark logos
  whatsapp-group-qr.png
  techshoppro-logo.webp
src/
  app/
    page.tsx                 # known sections
    admin/                   # admin UI routes
    api/                     # API routes
  components/
    IntroSplash.tsx          # 4s loader
    ParticleBackground.tsx   # particle network
    ShopByCategory.tsx       # catalog modal UI
  data/
    site.ts                  # contact details, WhatsApp helpers
    catalogSeed.ts           # seed catalog
  lib/
    adminAuth.ts             # cookie signing/verification
    catalogStore.ts          # KV (persistent) + in-memory fallback
```

---

## Notes

- No order/checkout logic is included (contact-only).
- Third‑party logos/images are used as demo assets. Replace them if you publish commercially.
