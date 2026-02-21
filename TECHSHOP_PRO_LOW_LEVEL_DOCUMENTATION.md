# TechShop Pro — Low‑Level Developer Documentation (v2)

This document explains **exactly where and how to edit** the TechShop Pro demo storefront.

It is written to help **a developer or an AI coding agent** quickly understand the codebase.

---

## 0) What this project is (and is not)

**TechShop Pro** is a **portfolio/demo storefront** built with:

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS

Key product goals:

- Keep the **black & gold** look
- Keep the **4‑second IntroSplash loader**
- Show products as **cards with images + details + contact CTA**
- No checkout/cart/payments (demo only)

Deployment goal:

- Works on **Vercel free tier** as a standard Next.js app (includes API routes)

---

## 1) Quick “Where do I change X?” map

### Branding / contact / WhatsApp

- `src/data/site.ts`

Edit:

- Store name + description
- Phone / email
- WhatsApp group link + QR

### Categories + products (seed)

- `src/data/catalogSeed.ts`

This is the initial catalog used to seed the in-memory store.

### Product images

- `public/products/*`

Each product card expects an `image` like:

- `/products/nord.png`

If missing, it falls back to:

- `/products/placeholder.png`

### Optional watermark logos

- `public/logos/*`

If a product has `logo: "/logos/nordvpn.svg"`, it shows as a subtle watermark overlay.

### Shop UI (category grid + popup)

- `src/components/ShopByCategory.tsx`

### Intro loader

- `src/components/IntroSplash.tsx`
- `src/components/ParticleBackground.tsx`

### Admin panel

- UI route: `src/app/admin/page.tsx`
- Login route: `src/app/admin/login/page.tsx`
- Admin UI client: `src/app/admin/ui/AdminClient.tsx`

### API routes

- Public catalog (optional): `src/app/api/catalog/route.ts`
- Admin catalog CRUD: `src/app/api/admin/*`

### Admin auth

- `src/lib/adminAuth.ts`

### Catalog store

- `src/lib/catalogStore.ts`

---

## 2) Data model (what a Product looks like)

Type definitions live here:

- `src/types/catalog.ts`

Important fields:

- `id` (string) — stable slug, used as unique key
- `name` (string) — display name
- `categoryId` — category grouping
- `image` (optional) — product card image (`/public` path)
- `logo` (optional) — watermark overlay (`/public` path)
- `planLabel` (optional) — short plan text (e.g., “2 Years • Unlimited Devices”)
- `priceLabel` (optional) — display price (string)
- `availability` — `available | sale | limited | contact | request | unavailable`
- `features` (optional) — bullet list (first 3 are shown on cards)
- `isActive` — if false, hidden from the public storefront

---

## 3) How the public storefront gets its catalog

The storefront does **not** read from `src/data/shop.ts` (that file is legacy).

Instead:

1. Seed catalog:
   - `src/data/catalogSeed.ts`
2. In-memory store:
   - `src/lib/catalogStore.ts`
3. Home page loads it server-side and passes to UI:
   - `src/app/page.tsx`

If you want “real” persistence, replace `catalogStore.ts` with a DB implementation.

---

## 4) Admin panel behavior

### Routes

- `/admin/login` — password form
- `/admin` — catalog manager (requires valid cookie)

### Authentication

Admin auth is demo-simple:

- Password compare against env var `ADMIN_PASSWORD`
- Signed cookie session using `ADMIN_SESSION_SECRET`

Code:

- `src/lib/adminAuth.ts`

### Admin API

- `GET /api/admin/catalog` — returns full catalog
- `PUT /api/admin/catalog` — replace catalog (import)
- `POST /api/admin/catalog?action=reset` — reset to seed
- `POST /api/admin/products` — upsert product
- `PATCH /api/admin/products/:id` — patch fields
- `DELETE /api/admin/products/:id` — remove product

Admin UI consumes these endpoints in:

- `src/app/admin/ui/AdminClient.tsx`

---

## 5) Changing the IntroSplash loader

File:

- `src/components/IntroSplash.tsx`

Key knobs:

- `DURATION_MS` — how long the overlay stays visible
- `TARGET_TEXT` — the scrambling text that resolves

Particle visuals:

- Adjust props passed into `ParticleBackground` inside IntroSplash.

Performance notes:

- Mobile caps DPR and reduces particle density.
- Expensive blur effects are limited on small screens.

---

## 6) Vercel deployment settings

### Required

Nothing special is required — deploy as a normal Next.js app.

### Recommended environment variables

- `NEXT_PUBLIC_SITE_URL` — canonical URL for sitemap + metadata
- `ADMIN_PASSWORD` — admin login password
- `ADMIN_SESSION_SECRET` — long random string

---

## 7) Common edits checklist

### Add a new product

Option A (seed): edit `src/data/catalogSeed.ts` and add a new product object.

Option B (admin): go to `/admin` → “Add product”.

### Add a new product image

1. Drop file in `public/products/`.
2. Set product `image` to `/products/<filename>`.

### Change contact number / email

- Edit `src/data/site.ts`.

---

## 8) Safety / demo note

This project is presented as a **portfolio demo**.

- No license circumvention features.
- Avoid presenting it as an official reseller storefront.
