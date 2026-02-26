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

### MongoDB-backed admin auth + draft catalog

This project uses **MongoDB** for:

- **Admin credentials** (stored as a **bcrypt hash**)
- **Draft catalog** (categories + products) so CRUD works on Vercel serverless

Required env:

- `MONGODB_URI`
  - recommended: MongoDB Atlas connection string
- `MONGODB_DB` (optional, default: `techshop_pro`)

Admin env (used only to seed the *first* admin user in MongoDB if none exists):

- `ADMIN_USERNAME` (default: `admin`)
- `ADMIN_AUTH_KEY` (default: `T3ch$hopPr0`)
- `ADMIN_SESSION_SECRET` — cookie signing secret

---

### “Save all changes” → GitHub → Vercel auto‑redeploy

The storefront uses a **published** catalog stored in:

- `src/data/catalogSeed.ts`

The admin panel edits a **draft** in MongoDB.

When you click **Save all changes** in the admin panel, the server will:

1. Read the draft catalog from MongoDB
2. Commit it to GitHub by rewriting `src/data/catalogSeed.ts`
3. Vercel will detect the commit and **redeploy automatically**

To enable publishing, set:

- `GITHUB_TOKEN` (fine‑grained token with Contents: Read & Write)
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BRANCH` (default: `main`)
- `GITHUB_CATALOG_PATH` (default: `src/data/catalogSeed.ts`)

---

### Uploading product images

The product editor supports uploading images to **Vercel Blob** (recommended for Vercel Free/Hobby).

Create a Blob store in Vercel → Storage. Vercel will inject:

- `BLOB_READ_WRITE_TOKEN`

---

## Editing the catalog

Seed data lives in:

- `src/data/catalogSeed.ts`

Public storefront reads from a server-side catalog store seeded by that file:

- `src/lib/catalogStore.ts`

Admin CRUD writes to a draft catalog in MongoDB:

- `src/lib/draftCatalogStore.ts`

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
    adminUsers.ts            # MongoDB admin user (bcrypt)
    mongodb.ts               # MongoDB connection helper
    draftCatalogStore.ts     # MongoDB draft catalog for admin CRUD
    catalogStore.ts          # published catalog for storefront
```

---

## Notes

- No order/checkout logic is included (contact-only).
- Third‑party logos/images are used as demo assets. Replace them if you publish commercially.
