# TechShop Pro — Long‑Term Low‑Level Developer Documentation (v3)

Last updated: 2026‑02‑28

This is a **code-level** guide to TechShop Pro. It explains:

- how the project is structured
- where data comes from
- how admin auth works
- how the UI works (category modal, product details, cart)
- how to safely edit/extend the codebase long-term

It is written for someone who will maintain the code (or delegate tasks to a developer/AI).

---

## 1) What this project is

TechShop Pro is a **Next.js App Router** website with:

- a public storefront (one-page layout)
- a MongoDB-backed **Admin panel** for categories/products
- a **cart** (localStorage) + “quote-style checkout” (final purchase via contact)

It is designed for **Vercel Free/Hobby tier**:

- no long-running servers
- no writing to filesystem at runtime
- persistence is via **MongoDB Atlas** (and optionally Vercel Blob for images)

What it does **not** include:

- payment gateway
- order database
- user accounts

---

## 2) Tech stack

- **Next.js** (App Router)
- **React + TypeScript**
- **Tailwind CSS**
- **MongoDB** for admin credentials + catalog persistence
- **Vercel Blob** (optional) for image uploads

Key UI libraries:

- `lucide-react` for icons
- `@vercel/analytics` (optional)

---

## 3) Local development

### Requirements

- Node.js 18+ (Node 20 recommended)

### Install

```bash
npm install
```

### Run dev server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Production build (sanity check)

```bash
npm run build
npm run start
```

---

## 4) Environment variables

### Where to find the full list

The canonical list lives in:

- **`/.env.example`** (repo root)

Also worth checking:

- `README.md` (high-level explanation)
- searching the codebase for `process.env.` (source of truth)

### Public vs server env vars (important)

- Variables starting with **`NEXT_PUBLIC_`** are embedded into the browser bundle at build time.
  - Changing them requires a redeploy.
- Everything else is **server-only** (API routes / server components).

### Required for a real Vercel deployment

#### 1) MongoDB (required for persistence)

- `MONGODB_URI` **(required)**
  - get it from MongoDB Atlas → Connect → Drivers
  - must be reachable from Vercel (Atlas Network Access must allow it)

- `MONGODB_DB` **(recommended)**
  - default is `techshop_pro`
  - you can rename it, but then make sure your MongoDB user has permissions

The code reads these in:

- `src/lib/mongodb.ts`

#### 2) Admin auth + sessions

- `ADMIN_SESSION_SECRET` **(required in production)**
  - used to sign the admin cookie
  - generate using:

```bash
openssl rand -base64 32
```

- `ADMIN_AUTH_KEY` **highly recommended**
  - used to seed the first admin user into MongoDB
  - after the admin user exists in MongoDB, login checks MongoDB’s bcrypt hash

- `ADMIN_USERNAME` (optional)
  - default `admin`

Files:

- `src/lib/adminAuth.ts` (cookie/signing, 1-hour TTL)
- `src/lib/adminUsers.ts` (bcrypt user in MongoDB)

⚠️ **Note about `$` in env values**:

Next’s env loading can treat `$...` as expansion. If your key contains `$`, write it as `\$` in `.env` files.
In Vercel dashboard, you can usually paste it normally.

#### 3) Site URL (recommended)

- `NEXT_PUBLIC_SITE_URL` (recommended)
  - used for metadata base URL + sitemap
  - set this to your real domain in Vercel production, e.g.

```text
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

If you don’t set it, the code falls back to `VERCEL_URL` (auto-provided by Vercel).

File:

- `src/data/site.ts`

### Optional env vars

#### Vercel Blob (only if you use Admin image upload)

- `BLOB_READ_WRITE_TOKEN`
  - create a Blob store in Vercel → Storage → Blob
  - connect it to your project
  - Vercel injects this token automatically in production

Used in:

- `src/app/api/admin/upload/route.ts`

#### Legacy GitHub publishing (not required)

There is a leftover API route that can commit the catalog seed file to GitHub, but the UI doesn’t call it anymore.

If you ever re-enable that, it needs:

- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- (optional) `GITHUB_BRANCH`
- (optional) `GITHUB_CATALOG_PATH`

Route:

- `src/app/api/admin/publish/route.ts`

If you don’t need it, you can delete this route safely.

---

## 5) Vercel deployment notes (Free tier friendly)

### How to set env vars on Vercel

Vercel **does not use your local `.env` file in production**.

Go to:

- Project → Settings → Environment Variables

Set variables for:

- **Production** (required)
- Preview (recommended)

### MongoDB Atlas checklist

Most deployment failures come from Atlas configuration:

- **Network Access / IP Access List**
  - simplest: allow `0.0.0.0/0` (works, but less secure)
  - better: allow only Vercel IP ranges (harder because they change)

- **Database user permissions**
  - give the user `readWrite` on the DB you configured (`MONGODB_DB`)

### Why the site updates immediately

The storefront reads the catalog from MongoDB via server routes and disables caching:

- `src/lib/catalogStore.ts` reads Mongo catalog (seed fallback)
- `src/app/api/catalog/route.ts` sets `Cache-Control: no-store`
- `src/app/page.tsx` is `dynamic = "force-dynamic"`

That combination makes catalog edits appear without redeploy.

Trade-off:

- the home page is not statically cached
- you pay the cost of server rendering per request

If you ever want caching (and can accept delay), switch to `revalidate = N`.

---

## 6) High-level code map

```text
public/
  products/                 # static product images
  logos/                    # watermark logos
  placeholder.png           # fallback images

src/
  app/
    layout.tsx              # global layout, providers (CartProvider), NavBar
    page.tsx                # home page sections + server-side catalog load
    cart/page.tsx           # cart page

    admin/
      page.tsx              # admin panel (server gate)
      login/page.tsx        # admin login form
      ui/AdminClient.tsx    # huge client component (CRUD UI)

    api/
      catalog/route.ts      # public catalog JSON
      admin/*               # admin login/logout/catalog CRUD/upload

  components/
    NavBar.tsx
    IntroSplash*.tsx
    ShopByCategory.tsx      # category grid + modal + product details
    cart/
      CartProvider.tsx      # localStorage cart state
      CartPageClient.tsx    # cart UI + totals

  data/
    site.ts                 # phone/email/whatsapp + metadata URL
    catalogSeed.ts          # seed categories/products

  lib/
    mongodb.ts              # Mongo connection helper
    draftCatalogStore.ts    # Mongo catalog persistence
    catalogStore.ts         # public catalog reader (mongo + seed fallback)
    adminAuth.ts            # signed cookie session (1h)
    adminUsers.ts           # bcrypt admin user in Mongo

  types/
    catalog.ts              # TypeScript types

  styles/
    globals.css             # theme tokens + global styling
```

---

## 7) Data model (Catalog, Category, Product)

Types:

- `src/types/catalog.ts`

### Category

```ts
export type Category = {
  id: string;
  name: string;
  description: string;
  iconName: IconName;
  sortOrder?: number;
};
```

### Product

Key fields used in the UI:

- `id`: stable unique string (slug)
- `name`
- `categoryId`: links to Category
- `image`: `/public/...` path or blob URL
- `logo`: watermark overlay image
- `price: number`
- `showPrice?: boolean` (if false → display “Contact for price”)
- `planLabel`: small subtitle
- `shortDescription`: only shown in opened product
- `features: string[]`: bullet points in opened product
- `badges?: string[]`: rendered as tag pills
- `availability`: affects labels and disabling buy when unavailable
- `isActive`: hides product from public listing

### Badge tags format

Admin edits badges as:

```text
New, Best Seller, Warranty
```

Storefront uses an array:

```ts
badges: ["New", "Best Seller", "Warranty"]
```

The conversion is done in the admin UI and the store normalizer.

---

## 8) Catalog persistence (MongoDB)

### Where the catalog is stored

MongoDB collection:

- `catalog_drafts`

Document id:

- `_id = "draft:v1"`

Code:

- `src/lib/draftCatalogStore.ts`

### Why there’s a “draft” name

Historically there may have been draft vs published.
In this version:

- the draft is effectively the live catalog

### Seed fallback

If MongoDB is missing/unreachable:

- Admin uses in-memory store
- Public site falls back to seed catalog

Seed file:

- `src/data/catalogSeed.ts`

Public catalog reader:

- `src/lib/catalogStore.ts`

---

## 9) Public storefront flow

### Home page

File:

- `src/app/page.tsx`

It loads catalog server-side:

```ts
const catalog = await getPublicCatalog();
```

Then renders sections:

- `Hero`
- `ShopByCategory`
- `TrustedSupport`
- `ContactSection`

### “Browse / Categories / Products” UI

File:

- `src/components/ShopByCategory.tsx`

Behavior:

1) Category grid renders from props
2) Clicking a category opens a modal overlay
3) Inside the modal:
   - small cards list products
   - clicking a product opens the “large opened card” view
4) Small cards show:
   - image + name
   - plan label
   - price (or “contact for price”)
   - availability pill
   - badges as tag pills
   - Buy button
5) Opened card shows:
   - description
   - bullet points
   - Add to cart
   - Contact button (scrolls to `#contact`)

### Live refresh without reload

`ShopByCategory.tsx` re-fetches `/api/catalog`:

- on mount
- on tab focus

That’s why admin edits appear quickly.

---

## 10) Cart

Cart is intentionally simple and client-side only.

### State + persistence

- `src/components/cart/CartProvider.tsx`

Stored in localStorage key:

```text
techshop_cart_v1
```

Cart items are:

```ts
{ productId: string; qty: number }
```

### Cart page

- route: `src/app/cart/page.tsx`
- UI: `src/components/cart/CartPageClient.tsx`

The cart page:

- fetches `/api/catalog` (no-store)
- matches product ids to get names/prices
- computes totals
- shows checkout note:
  - “Price can be negotiated”
  - Contact button → `/#contact`

### Changing cart behavior

Common edits:

- Change storage key: `CartProvider.tsx` (`STORAGE_KEY`)
- Add “variants” (e.g., duration): extend `CartItem` type and update add/remove logic
- Add shipping: modify total calculation in `CartPageClient.tsx`

If you want cross-device carts, you need a backend (Mongo collection keyed by device/user).

---

## 11) Admin panel (code-level)

### Routing

- `/admin/login` → login page
- `/admin` → admin panel

Gatekeeping:

- `src/app/admin/page.tsx` calls `requireAdminOrRedirect()`

### Session cookie

Cookie name:

- `tsp_admin`

TTL:

- 1 hour (hard-coded)

Code:

- `src/lib/adminAuth.ts`

### Login seed behavior

On a fresh DB:

1) `POST /api/admin/login`
2) `ensureAdminSeedUser()` creates the admin user using env values
3) login checks bcrypt hash

Code:

- `src/lib/adminUsers.ts`

### CRUD endpoints

Public:

- `GET /api/catalog` → public catalog

Admin (requires cookie):

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/catalog`
- `POST /api/admin/catalog?action=reset`
- `PUT /api/admin/catalog` (replace/import)

Category CRUD:

- `POST /api/admin/categories`
- `PATCH /api/admin/categories/[id]`
- `DELETE /api/admin/categories/[id]`

Product CRUD:

- `POST /api/admin/products`
- `PATCH /api/admin/products/[id]`
- `DELETE /api/admin/products/[id]`

Image upload:

- `POST /api/admin/upload`

### Why AdminClient is “big”

`src/app/admin/ui/AdminClient.tsx` is a single large file that contains:

- table + card views
- modal forms
- validation
- all fetch calls

This works, but long-term it’s harder to maintain.
If you plan to keep evolving the admin UI, consider splitting into:

- `admin/ui/categories/*`
- `admin/ui/products/*`
- `admin/ui/forms/*`

---

## 12) Styling system

### Theme tokens

CSS variables live in:

- `src/styles/globals.css`

```css
:root {
  --bg: 6 6 8;
  --panel: 14 14 18;
  --fg: 246 246 246;
  --muted: 165 165 175;
  --gold: 212 175 55;
  --gold2: 255 214 102;
  --ring: 212 175 55;
}
```

Tailwind uses these as `rgb(var(--gold) / 0.2)` style colors in className strings.

### Global mobile/safari polish

- `svh` is used (`min-h-svh`) for modern mobile browser viewport stability
- `viewportFit: "cover"` is set in `layout.tsx` for iOS safe area
- `-webkit-overflow-scrolling: touch` is used for smooth modal scrolling

If you add new fixed overlays/modals, copy the same pattern.

---

## 13) “Where do I edit X?” (practical cookbook)

### Change contact phone/email

- `src/data/site.ts` → `CONTACT`
- also update `phoneE164` for WhatsApp

### Change WhatsApp group link + QR image

- `src/data/site.ts` → `WHATSAPP_GROUP_LINK`, `WHATSAPP_GROUP_QR`
- QR image file: `public/whatsapp-group-qr.png`

### Change hero text / landing page sections

- `src/components/Hero.tsx`
- other sections:
  - `src/components/TrustedSupport.tsx`
  - `src/components/ContactSection.tsx`

### Change the category grid cards

- `src/components/ShopByCategory.tsx`

### Change product card layout (small)

- `src/components/ShopByCategory.tsx`
  - section under `items.map((p) => ...)`

### Change opened product view (large)

- `src/components/ShopByCategory.tsx`
  - section under `activeProduct ? ... : ...`

### Change cart checkout note/contact

- `src/components/cart/CartPageClient.tsx`

### Change site metadata / OG image

- `src/app/layout.tsx`
  - `metadata` object

OG image path:

- `public/og.png`

---

## 14) Adding a new product field (step-by-step)

Example: you want to add `warrantyMonths: number`.

1) Add it to the type:

- `src/types/catalog.ts`

2) Add default + backward compatibility:

- `src/lib/draftCatalogStore.ts` → `normalizeCatalog()`

3) Update seed if desired:

- `src/data/catalogSeed.ts`

4) Admin UI:

- `src/app/admin/ui/AdminClient.tsx`
  - add input in product editor
  - ensure it’s included in the upsert payload

5) Storefront UI:

- `src/components/ShopByCategory.tsx`
  - render it in small or opened card as needed

6) Cart (only if needed)

- `src/components/cart/CartPageClient.tsx`

7) Deploy

- redeploy the site

---

## 15) Common troubleshooting

### “Admin logs me out randomly”

Causes:

- `ADMIN_SESSION_SECRET` not set consistently in Vercel Production
- you set env vars only in Preview, not Production
- multiple deployments with different secrets

Fix:

- ensure `ADMIN_SESSION_SECRET` is set in the correct environment
- redeploy

### “Admin edits don’t show on the storefront”

Check:

- MongoDB is reachable (Atlas IP allowlist)
- `/api/catalog` returns updated data
- `Cache-Control: no-store` exists (it should)

### “Mongo not authorized”

Common cause:

- URI has no db name and the default db becomes `test`
- your user only has permissions for `techshop_pro`

Fix:

- set `MONGODB_DB=techshop_pro`

### “Uploads fail”

- you didn’t connect Vercel Blob store
- `BLOB_READ_WRITE_TOKEN` missing

---

## 16) Security & maintenance notes (be critical)

This project uses a simple admin auth model:

- one shared key
- cookie-based session

For a real public deployment, consider adding:

- rate limiting on `/api/admin/login`
- audit logging (who changed what)
- a way to rotate admin keys from the UI
- restricting admin routes by IP (optional)

Also:

- never commit `.env` to Git
- rotate MongoDB creds if they were shared

---

## 17) Suggested refactors (if you keep growing)

If you expect ongoing development:

- split `AdminClient.tsx` into smaller components
- add schema validation (e.g., zod) for API payloads
- add optimistic UI updates with a central data hook
- introduce a simple “catalog version” field for debugging caching issues

