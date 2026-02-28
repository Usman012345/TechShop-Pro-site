# TechShop Pro — Storefront + Admin (Next.js + MongoDB)

TechShop Pro is a **mobile‑first storefront** built with:

- **Next.js (App Router) + TypeScript + Tailwind CSS**
- Luxury **black + gold** UI
- **Shop by category → modal**
  - small product cards (image + key info)
  - clickable cards open a single **large product details** view
- **Cart** (localStorage) + **quote-style checkout**
  - totals are shown
  - purchase is completed by contacting the seller (no online payments)
- **Admin panel** (`/admin`) backed by **MongoDB**
  - edits are reflected on the public site without redeploy

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

Open:

```text
http://localhost:3000
```

---

## Environment variables

Copy `/.env.example` → `.env.local` for local development.

On Vercel, set the same variables in:

- Project → Settings → Environment Variables

### Required (for real persistence)

- `MONGODB_URI`
- `ADMIN_SESSION_SECRET`
- `ADMIN_AUTH_KEY` (used to seed the first admin user)

Recommended:

- `MONGODB_DB` (default: `techshop_pro`)
- `NEXT_PUBLIC_SITE_URL` (your real domain)

### Optional

- `BLOB_READ_WRITE_TOKEN` (only if you want Admin image uploads via Vercel Blob)

Legacy/unused by default:

- `GITHUB_*` env vars are only needed if you re-enable the GitHub publish route.

---

## Admin panel

- Login: `/admin/login`
- Panel: `/admin`

Admin session:

- lasts **1 hour** after login

Admin data storage:

- admin credentials are stored in MongoDB as a **bcrypt hash**
- catalog is stored in MongoDB so storefront updates are live

---

## Project structure

```text
public/
  products/                  # product images
  logos/                     # watermark logos

src/
  app/
    page.tsx                 # home sections
    cart/page.tsx            # cart
    admin/                   # admin routes
    api/                     # API routes

  components/
    ShopByCategory.tsx       # category grid + modal + product open view
    NavBar.tsx               # navbar + cart count + admin/login link
    cart/                    # cart provider + cart page client UI

  data/
    site.ts                  # contact details + site metadata URL
    catalogSeed.ts           # seed catalog

  lib/
    mongodb.ts               # Mongo client helper
    draftCatalogStore.ts     # Mongo-backed catalog storage
    catalogStore.ts          # public catalog reader (Mongo + seed fallback)
    adminAuth.ts             # signed cookie session
    adminUsers.ts            # bcrypt admin user

  types/
    catalog.ts               # Catalog/Category/Product types

  styles/
    globals.css              # theme tokens + global styling
```

---

## Low-level documentation

See:

- `TECHSHOP_PRO_LOW_LEVEL_DOCUMENTATION.md`

