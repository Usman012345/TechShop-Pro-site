# TechShop Pro — Demo Storefront v2 Specification (Public Catalog + Admin Panel)

This document is written so an AI coding agent (or developer) can **recreate or upgrade the provided TechShop Pro site** into a richer demo project that:

- Keeps the existing **black & gold** look-and-feel and the **4‑second IntroSplash** loader.
- Shows your full product catalog as **cards with images + details + a Contact button** (no checkout/cart).
- Adds a secure **Admin Panel** to manage categories/products/assets.
- Adds minimal **server-side logic** (auth + CRUD + persistence) suitable for a portfolio demo.

> **Important intent note (demo only):** This project is a portfolio demo. Do not present it as an official reseller site and do not include any license‑circumvention features. All brand names/logos are used as placeholders.

---

## 0) Baseline (what already exists in the provided zip)

The current project is a **Next.js App Router + TypeScript + Tailwind CSS** single-page storefront with:

- `src/components/IntroSplash.tsx` — 4s loader with particle canvas (must keep)
- `src/components/ShopByCategory.tsx` — category grid + modal popup with product cards
- `src/data/site.ts` — **contact details** (must keep as-is) and WhatsApp helpers
- `public/techshoppro-logo.webp` — store logo (must keep)
- Luxury black/gold theme driven by `src/styles/globals.css`

### Current limitation to address
The current repo uses **static export** (`output: "export"` in `next.config.mjs`), which prevents:
- Next.js route handlers / server actions
- a real Admin Panel with persistence (DB)

For v2, we will **remove static export** so we can implement server-side logic.

---

# Part 1 — UI/UX Design Specification (Public Site)

## 1.1 Design goals (keep existing vibe)
- **Visual identity:** premium/luxury “black + gold” theme; same typography (Inter + Cinzel).
- **Motion:** keep IntroSplash; keep subtle sheens, gold glows, hover transitions.
- **Performance:** image thumbnails must be optimized (small file sizes); keep the modal scroll smooth.
- **Content clarity:** each product card shows:
  - Product image (thumbnail)
  - Name
  - 2–4 short details (price, duration, device limit, availability)
  - Badge (Sale / Available / Limited / On Request)
  - Primary CTA: **Contact** (WhatsApp deep link with prefilled message)
- **No cart/checkout:** This is a catalog + contact experience only.

## 1.2 Public routes / pages
### `/` — Home (single page)
Sections in order (keep the same structure):
1) **Hero** (`Hero.tsx`)
2) **Shop by category** (`ShopByCategory.tsx`)
3) **Trusted support** (`TrustedSupport.tsx`)
4) **Contact** (`ContactSection.tsx`)

### Optional public routes (nice-to-have but not required)
- `/product/[slug]` — a full product detail page (if you want to show SSR + SEO).  
  Not required; the modal experience is enough for this demo.

## 1.3 Navigation behavior
- Keep the sticky NavBar.
- Keep anchor links: Home, Categories, Support, Contact.
- Add an **Admin** link that is hidden on mobile or placed in footer (optional).  
  If exposed, it should navigate to `/admin` (login screen).  

## 1.4 Category cards (grid)
- Keep existing grid layout and styling.
- Each category card shows:
  - Icon
  - Name + short description
  - Count of active products
- Clicking opens a **modal** with products for that category.

## 1.5 Category modal (product list popup)
Keep the modal pattern already implemented, but upgrade the content:

### Modal header
- Category name, description
- Close button (ESC closes, click outside closes)
- Optional: Search input (recommended if categories contain 10+ products)
  - Search filters by product name + tags

### Modal body
- Grid of product cards.
- Max height 78svh with smooth scrolling (already implemented).

### Modal footer tip
Keep the small “Tip: Click Contact…” hint.

## 1.6 Product card design (public)
Each product card should contain:

1) **Thumbnail image**
   - Use `next/image` with `sizes` for responsive loading.
   - Ratio: 16:10 or square; use `object-cover`.
   - If missing: use `/public/products/placeholder.png`.

2) **Brand watermark** (existing behavior)
   - Keep the logo watermark behind the card, but reduce opacity so the thumbnail stays clear.

3) **Title**
   - `font-display`, 16–18px equivalent.

4) **Badges**
   - Render up to 2 badges as small pill chips:
     - `SALE`, `AVAILABLE`, `LIMITED`, `ON REQUEST`, `CONTACT`, `NEW`
   - Badge color tokens should reuse gold accents.

5) **Quick details**
   - 2–4 key/value rows, example:
     - Price: Rs 1000
     - Validity: Till 2027
     - Devices: 5 devices
     - Delivery: “On your email” (for subscriptions)
   - If no price: show “Price: Contact”.

6) **Mini description / features**
   - 2–3 bullet points max (avoid long walls of text in cards).

7) **CTA**
   - Primary button: **Contact**
     - Opens WhatsApp with a pre-filled message:
       - Greeting (keep Arabic default): `السلام عليكم`
       - Product name
       - Plan/duration
       - Price (if known)
     - Example message template:
       ```
       السلام عليكم
       I want: {Product Name}
       Plan: {Duration / Validity}
       Price: {Price or "Contact"}
       ```
   - Secondary text under button: “Instant reply on WhatsApp” (optional)

## 1.7 Contact section (public)
- Keep `src/data/site.ts` contact details **unchanged**.
- Keep WhatsApp group QR and “Join group” button.

## 1.8 Accessibility & responsiveness requirements
- Keyboard:
  - Modal closes on ESC.
  - Focus is trapped logically (at minimum, focus the close button on open, already done).
- Contrast:
  - Gold text on dark background must meet readable contrast.
- Mobile:
  - Product grid becomes 1–2 columns.
  - Touch targets: min height ~44px.
- Images:
  - Lazy-load non-critical images in modals.

---

# Part 2 — Admin Panel Logic Specification

## 2.1 Purpose
The Admin Panel is for **you (the site owner)** to:
- Create/edit/delete categories
- Create/edit/delete products
- Toggle product visibility (active/inactive)
- Manage “badges” (sale, limited stock, etc.)
- Assign images and watermarks
- Reorder items (display order)

No order management, no payments, no customer accounts.

## 2.2 Admin routes
All admin routes require authentication:

- `/admin` — login screen
- `/admin/dashboard` — stats + shortcuts
- `/admin/products` — product list + filters
- `/admin/products/new` — create product
- `/admin/products/[id]/edit` — edit product
- `/admin/categories` — category list + CRUD
- `/admin/assets` — image asset browser (optional, recommended)
- `/admin/settings` — read-only contact info (optional)

## 2.3 Authentication model
Because it’s a demo, keep auth simple but real:

### Option A (recommended): Admin user in DB
- Table `AdminUser` with:
  - `email`
  - `passwordHash` (bcrypt)
  - `role` (admin)
- Login creates a session cookie.

### Option B: Credentials in environment variables (fastest)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH` (bcrypt hash)
- Login compares email + bcrypt(password, hash)
- Session stored in signed JWT cookie.

Either option is acceptable, but Option A showcases more backend skill.

## 2.4 Admin UI design (match public theme)
- Same black/gold theme variables.
- Layout:
  - Left sidebar (desktop) or drawer (mobile) with nav links
  - Top bar with store logo + “Logout”
- Components:
  - Data table/list with search and filters
  - Form pages using the same “rounded-2xl panels”

## 2.5 Product management requirements
### Product list view (`/admin/products`)
- Table columns:
  - Thumbnail
  - Name
  - Category
  - Price display
  - Badges
  - Active toggle
  - Updated date
  - Actions (Edit / Duplicate / Archive)
- Filters:
  - Category
  - Active/inactive
  - Badge (Sale, Limited, etc.)
  - Pricing type (Fixed / Subscription / Contact)
- Search:
  - Name search, case-insensitive
- Bulk actions:
  - Activate / deactivate
  - Set badge “Sale”
  - Delete (soft delete)

### Product create/edit form
Fields (minimum):
- `name` (required)
- `slug` (auto from name; editable)
- `categoryId` (required)
- `status` (enum): `AVAILABLE | LIMITED | ON_SALE | ON_REQUEST | CONTACT_ONLY | HIDDEN`
- `pricingType` (enum): `FIXED | RECURRING | CONTACT`
- `priceAmount` (number, nullable)
- `priceCurrency` (default `PKR`)
- `billingPeriod` (enum): `ONE_TIME | MONTH | YEAR | CUSTOM` (nullable)
- `validityText` (string) — e.g., “Till 2027”, “1 Month”, “2 Years”
- `deviceLimitText` (string) — e.g., “5 Devices”, “Unlimited”
- `deliveryText` (string) — e.g., “Delivered to your email”
- `shortDescription` (string, 140 chars)
- `features` (string array; up to 6)
- `thumbnailPath` (string) — `/products/...`
- `watermarkLogoPath` (string) — `/logos/...` or blank
- `isActive` (boolean)
- `sortOrder` (number)

Quality-of-life:
- “Duplicate product” button creates a new draft with same fields.
- “Preview” link opens the public modal with this product highlighted (optional).

### Validation rules
- `name` 2–80 chars
- `slug` unique
- If `pricingType = FIXED`, `priceAmount` must be present > 0
- If `pricingType = CONTACT`, `priceAmount` must be null
- `thumbnailPath` must be a safe local path or a safe URL (no `javascript:` etc.)

## 2.6 Category management requirements
Category fields:
- `id` (slug-like string; stable)
- `name`
- `description`
- `iconName` (must match a key in `src/components/icons.tsx`)
- `sortOrder`
- `isActive` (optional; hides category if false)

Admin UI:
- List view with edit/delete
- Prevent deleting a category if it has products (or require reassignment)

## 2.7 Asset management (optional but recommended)
Because you already have a curated `Images.zip`, simplest approach is:

- Store images in `public/products/`
- Admin picks an image via an “Asset Picker” that lists known images.

Implementation options:
1) Maintain a static `assets-manifest.json` generated at build time.
2) Provide a protected API route `/api/admin/assets` that returns filenames from `public/products`.

For a portfolio demo, #1 is easiest and stable on Vercel.

---

# Part 3 — Server-Side Logic Specification

## 3.1 Required backend capabilities
- Admin authentication (sessions)
- Catalog persistence (DB)
- CRUD operations for categories/products
- Public read APIs (or server-side DB reads) for rendering the catalog
- Cache invalidation / revalidation when admin updates catalog

## 3.2 Tech stack recommendation (fits existing repo)
- Keep: Next.js App Router + TypeScript + Tailwind
- Add:
  - Prisma ORM (`prisma`, `@prisma/client`)
  - Zod for validation (`zod`)
  - bcrypt for password hashing (`bcryptjs`)
  - Optional: Auth.js / NextAuth (if you prefer a standard auth solution)

### Database
- Dev: SQLite
- Prod (Vercel): Postgres (Neon/Supabase) because serverless filesystems are ephemeral.

## 3.3 Data model (Prisma schema)
Example (agent can implement exactly):

```prisma
model Category {
  id          String   @id
  name        String
  description String
  iconName    String
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  products    Product[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum ProductStatus {
  AVAILABLE
  LIMITED
  ON_SALE
  ON_REQUEST
  CONTACT_ONLY
  HIDDEN
}

enum PricingType {
  FIXED
  RECURRING
  CONTACT
}

enum BillingPeriod {
  ONE_TIME
  MONTH
  YEAR
  CUSTOM
}

model Product {
  id               String        @id @default(cuid())
  slug             String        @unique
  name             String
  categoryId       String
  category         Category      @relation(fields: [categoryId], references: [id])

  status           ProductStatus @default(AVAILABLE)
  pricingType      PricingType   @default(CONTACT)
  priceAmount      Int?
  priceCurrency    String        @default("PKR")
  billingPeriod    BillingPeriod?

  validityText     String?
  deviceLimitText  String?
  deliveryText     String?
  shortDescription String?
  features         Json?         // store string[] in JSON

  thumbnailPath    String?
  watermarkLogoPath String?

  isActive         Boolean       @default(true)
  sortOrder        Int           @default(0)

  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
}

model AdminUser {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  role         String   @default("admin")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## 3.4 Server-side “catalog read” strategy (public)
Recommended approach (fast + SEO-friendly):

- `src/app/page.tsx` remains a server component.
- It loads categories/products from DB on the server:
  - `getCategoriesWithActiveProducts()`
- Then passes data into the client `ShopByCategory` component as props.

This avoids client-side fetch waterfalls and keeps the page snappy.

### Cache & revalidation
- Public catalog queries can be cached.
- When admin updates catalog, call:
  - `revalidatePath("/")`
  - optionally `revalidateTag("catalog")` if using tags.

## 3.5 Admin CRUD implementation approaches
### Approach A: Next.js Route Handlers (REST-like)
- Public:
  - `GET /api/catalog` → categories + active products
- Admin (protected):
  - `POST /api/admin/login`
  - `GET /api/admin/products`
  - `POST /api/admin/products`
  - `PUT /api/admin/products/:id`
  - `DELETE /api/admin/products/:id`
  - Same for categories

### Approach B: Server Actions (clean for forms)
- Use server actions for create/update/delete (recommended for App Router):
  - `createProductAction(formData)`
  - `updateProductAction(id, formData)`
  - `deleteProductAction(id)`
- Validate with Zod on the server.
- After mutation: `revalidatePath("/")`.

Either is fine. For an AI agent, Route Handlers are usually simpler to reason about; Server Actions are more “modern Next”.

## 3.6 Security & hardening (demo-level)
- Password hashing: bcrypt (never store plain password)
- Session cookie:
  - `httpOnly`, `secure` in production, `sameSite=lax`
- CSRF:
  - If using Server Actions, CSRF risk is reduced.
  - If using REST routes, implement CSRF token or ensure sameSite cookies and POST-only mutation routes.
- Rate limit login route (basic in-memory limiter is fine for demo).

## 3.7 Environment variables
Minimum:
- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL` (already supported)
- If using env-based admin auth:
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD_HASH`
  - `AUTH_SECRET` or `JWT_SECRET`

## 3.8 Seed strategy (very important)
- Provide a seed script that inserts:
  - Categories
  - Products (from the catalog list in Appendix A)
  - Admin user (optional)

---

# Appendix A — Catalog Content (Categories + Products)

This appendix provides the **exact catalog** from your message, normalized into a structured format that fits the schema above.

## A.1 Categories (recommended)
```ts
export const seedCategories = [
  {
    id: "security",
    name: "Antivirus & Security",
    description: "Antivirus suites, endpoint protection, and device security.",
    iconName: "Shield",
    sortOrder: 10,
  },
  {
    id: "microsoft",
    name: "Operating Systems & Office",
    description: "Windows activation and Microsoft Office tools.",
    iconName: "KeyRound",
    sortOrder: 20,
  },
  {
    id: "creative",
    name: "Design & Creative",
    description: "Editing, design, plugins, and creative productivity tools.",
    iconName: "Palette",
    sortOrder: 30,
  },
  {
    id: "vpn",
    name: "VPN Services",
    description: "Privacy, secure browsing, and fast global servers.",
    iconName: "Globe",
    sortOrder: 40,
  },
  {
    id: "utilities",
    name: "Utility Tools",
    description: "System utilities, drivers, downloaders, and repair tools.",
    iconName: "Wrench",
    sortOrder: 50,
  },
  {
    id: "data",
    name: "Data & Research Tools",
    description: "Recovery, research management, and professional utilities.",
    iconName: "Sparkles",
    sortOrder: 60,
  },
  {
    id: "writing",
    name: "Writing Tools",
    description: "Grammar and writing enhancement subscriptions.",
    iconName: "PenTool",
    sortOrder: 70,
  },
  {
    id: "media",
    name: "Entertainment & Media",
    description: "Streaming, games, and media subscriptions.",
    iconName: "Film",
    sortOrder: 80,
  },
  {
    id: "hardware",
    name: "Hardware & Gadgets",
    description: "Limited-stock gadgets and small hardware items.",
    iconName: "Wrench",
    sortOrder: 90,
  },
  {
    id: "specials",
    name: "Special Offers",
    description: "Promos, bundles, premium upgrades, and custom requests.",
    iconName: "Sparkles",
    sortOrder: 100,
  },
] as const;
```

> Note: You can add more icons from Lucide if you want “data” and “hardware” to feel more distinct.

## A.2 Product image mapping from `Images.zip`
Unzip `Images.zip` and copy files into:
- `public/products/`

Rename files to consistent kebab-case (recommended). Example mapping:

| Original filename | Recommended path in repo |
|---|---|
| `Adobe.jpeg` | `/products/adobe.jpeg` |
| `CorelDraw.png` | `/products/coreldraw.png` |
| `Windows.jpeg` | `/products/windows.jpeg` |
| `Nord.png` | `/products/nord.png` |
| `SurfShark.png` | `/products/surfshark.png` |
| `Kaspersky.png` | `/products/kaspersky.png` |
| `Grammerly.png` | `/products/grammarly.png` |
| `Internet download manager.jpeg` | `/products/idm.jpeg` |
| ... | ... |

If a product does not have an image, use:
- `/products/placeholder.png`

## A.3 Products (seed list)
Below is a complete seed list. Fields are intentionally “demo-friendly” and short so the UI stays clean.

```ts
export const seedProducts = [
  // =======================
  // Antivirus & Security
  // =======================
  {
    name: "ESET Antivirus",
    slug: "eset-antivirus-till-2027",
    categoryId: "security",
    status: "AVAILABLE",
    pricingType: "FIXED",
    priceAmount: 1000,
    billingPeriod: "ONE_TIME",
    validityText: "Till 2027",
    shortDescription: "Lightweight antivirus protection for everyday use.",
    features: ["Real-time protection", "Low system impact", "Best for home PCs"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "/logos/placeholder.svg",
    sortOrder: 10,
    isActive: true,
  },
  {
    name: "Avast Premium Security",
    slug: "avast-premium-security-till-2038",
    categoryId: "security",
    status: "AVAILABLE",
    pricingType: "FIXED",
    priceAmount: 2000,
    billingPeriod: "ONE_TIME",
    validityText: "Till 2038",
    shortDescription: "Premium security suite for long-term protection.",
    features: ["Advanced threat protection", "Web & email shield", "Easy setup"],
    thumbnailPath: "/products/avast-premium-security.png",
    watermarkLogoPath: "/logos/avast-premium.svg",
    sortOrder: 20,
    isActive: true,
  },
  {
    name: "Kaspersky Antivirus + VPN",
    slug: "kaspersky-antivirus-vpn-bundle",
    categoryId: "security",
    status: "AVAILABLE",
    pricingType: "FIXED",
    priceAmount: 3000,
    billingPeriod: "ONE_TIME",
    validityText: "Bundle",
    shortDescription: "Security + VPN bundle for safer browsing.",
    features: ["Antivirus protection", "VPN included", "Device security suite"],
    thumbnailPath: "/products/kaspersky.png",
    watermarkLogoPath: "/logos/kaspersky.svg",
    sortOrder: 30,
    isActive: true,
  },
  {
    name: "ESET Small Business Security + VPN",
    slug: "eset-small-business-security-vpn-10-devices",
    categoryId: "security",
    status: "AVAILABLE",
    pricingType: "RECURRING",
    priceAmount: 2000,
    billingPeriod: "MONTH",
    validityText: "Monthly plan",
    deviceLimitText: "10 devices",
    shortDescription: "Small business plan with VPN included.",
    features: ["Business-grade protection", "10-device coverage", "VPN included"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "/logos/placeholder.svg",
    sortOrder: 40,
    isActive: true,
  },
  {
    name: "Avast Ultimate Security",
    slug: "avast-ultimate-security-1-month",
    categoryId: "security",
    status: "AVAILABLE",
    pricingType: "FIXED",
    priceAmount: 2000,
    billingPeriod: "ONE_TIME",
    validityText: "1 Month",
    shortDescription: "All-in-one Avast suite for a month.",
    features: ["Premium suite", "Quick activation", "Best for short-term use"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "/logos/avast-premium.svg",
    sortOrder: 50,
    isActive: true,
  },
  {
    name: "Kaspersky Antivirus + VPN",
    slug: "kaspersky-antivirus-vpn-1-year",
    categoryId: "security",
    status: "AVAILABLE",
    pricingType: "FIXED",
    priceAmount: 2000,
    billingPeriod: "ONE_TIME",
    validityText: "1 Year",
    shortDescription: "Yearly Kaspersky bundle with VPN.",
    features: ["1 year validity", "VPN included", "Security suite"],
    thumbnailPath: "/products/kaspersky.png",
    watermarkLogoPath: "/logos/kaspersky.svg",
    sortOrder: 60,
    isActive: true,
  },
  {
    name: "Kaspersky Premium Security",
    slug: "kaspersky-premium-security-2-years-sale",
    categoryId: "security",
    status: "ON_SALE",
    pricingType: "CONTACT",
    validityText: "2+ Years",
    shortDescription: "Premium protection plan (sale).",
    features: ["Premium tier", "Long validity", "Contact for best price"],
    thumbnailPath: "/products/kaspersky.png",
    watermarkLogoPath: "/logos/kaspersky.svg",
    sortOrder: 70,
    isActive: true,
  },
  {
    name: "Avira Phantom Antivirus + VPN",
    slug: "avira-phantom-antivirus-vpn-3-months",
    categoryId: "security",
    status: "AVAILABLE",
    pricingType: "FIXED",
    priceAmount: 500,
    billingPeriod: "ONE_TIME",
    validityText: "3 Months",
    shortDescription: "Budget-friendly antivirus + VPN combo.",
    features: ["3-month plan", "VPN included", "Quick setup"],
    thumbnailPath: "/products/avira-phantom.jpeg",
    watermarkLogoPath: "/logos/avira-phantom.svg",
    sortOrder: 80,
    isActive: true,
  },

  // =======================
  // Operating Systems & Office
  // =======================
  {
    name: "Windows Activation Keys",
    slug: "windows-activation-keys",
    categoryId: "microsoft",
    status: "AVAILABLE",
    pricingType: "FIXED",
    priceAmount: 500,
    billingPeriod: "ONE_TIME",
    shortDescription: "Windows activation keys for supported editions.",
    features: ["Fast delivery", "Simple activation", "Support available"],
    thumbnailPath: "/products/windows.jpeg",
    watermarkLogoPath: "/logos/windows.svg",
    sortOrder: 10,
    isActive: true,
  },
  {
    name: "Microsoft Office 2024",
    slug: "microsoft-office-2024",
    categoryId: "microsoft",
    status: "AVAILABLE",
    pricingType: "FIXED",
    priceAmount: 1500,
    billingPeriod: "ONE_TIME",
    shortDescription: "Office suite for work and study.",
    features: ["Word, Excel, PowerPoint", "Offline apps", "Productivity essentials"],
    thumbnailPath: "/products/office2024.png",
    watermarkLogoPath: "/logos/microsoft-365.svg",
    sortOrder: 20,
    isActive: true,
  },
  {
    name: "Microsoft 365 Personal",
    slug: "microsoft-365-personal-1-year-5-devices-1tb",
    categoryId: "microsoft",
    status: "AVAILABLE",
    pricingType: "FIXED",
    priceAmount: 5000,
    billingPeriod: "YEAR",
    validityText: "1 Year",
    deviceLimitText: "5 Devices",
    deliveryText: "Includes 1TB cloud storage",
    shortDescription: "Microsoft 365 Personal yearly plan.",
    features: ["1TB OneDrive", "5 devices", "Office apps included"],
    thumbnailPath: "/products/microsoft-365.jpeg",
    watermarkLogoPath: "/logos/microsoft-365.svg",
    sortOrder: 30,
    isActive: true,
  },
  {
    name: "Microsoft Office 365",
    slug: "microsoft-office-365-1-year",
    categoryId: "microsoft",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    validityText: "1 Year",
    deliveryText: "Delivered to your email",
    shortDescription: "Office 365 yearly access.",
    features: ["Word, Excel, PowerPoint", "Outlook & OneDrive", "Everyday productivity"],
    thumbnailPath: "/products/microsoft-365.jpeg",
    watermarkLogoPath: "/logos/microsoft-365.svg",
    sortOrder: 40,
    isActive: true,
  },

  // =======================
  // Design & Creative
  // =======================
  {
    name: "Adobe Creative Cloud",
    slug: "adobe-creative-cloud-lifetime-warranty",
    categoryId: "creative",
    status: "AVAILABLE",
    pricingType: "FIXED",
    priceAmount: 2500,
    billingPeriod: "ONE_TIME",
    validityText: "Lifetime + 1 Year Warranty",
    shortDescription: "Creative suite for design and editing.",
    features: ["Full creative suite", "Design + video tools", "Premium workflow"],
    thumbnailPath: "/products/adobe.jpeg",
    watermarkLogoPath: "/logos/adobe.svg",
    sortOrder: 10,
    isActive: true,
  },
  {
    name: "CorelDRAW Graphics Suite",
    slug: "coreldraw-graphics-suite-latest",
    categoryId: "creative",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    validityText: "Latest version",
    shortDescription: "Vector design and layout tools.",
    features: ["Vector illustration", "Layout & typography", "Creative toolkit"],
    thumbnailPath: "/products/coreldraw.png",
    watermarkLogoPath: "/logos/coreldraw.svg",
    sortOrder: 20,
    isActive: true,
  },
  {
    name: "DaVinci Resolve",
    slug: "davinci-resolve",
    categoryId: "creative",
    status: "CONTACT_ONLY",
    pricingType: "CONTACT",
    shortDescription: "Professional video editing suite (contact for plan).",
    features: ["Editing & color grading", "Pro workflows", "Contact for details"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 30,
    isActive: true,
  },
  {
    name: "Autodesk Tools (AutoCAD, etc.)",
    slug: "autodesk-tools-autocad",
    categoryId: "creative",
    status: "CONTACT_ONLY",
    pricingType: "CONTACT",
    shortDescription: "Autodesk software tools (contact for available options).",
    features: ["AutoCAD & more", "Multiple options", "Contact for pricing"],
    thumbnailPath: "/products/autocad.jpeg",
    watermarkLogoPath: "/logos/autocad.svg",
    sortOrder: 40,
    isActive: true,
  },
  {
    name: "Boris FX Sapphire Plug-ins",
    slug: "boris-fx-sapphire-plugins",
    categoryId: "creative",
    status: "CONTACT_ONLY",
    pricingType: "CONTACT",
    shortDescription: "VFX plugin bundle (contact for details).",
    features: ["VFX plugins", "Pro effects", "Contact for availability"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 50,
    isActive: true,
  },
  {
    name: "Wondershare Filmora",
    slug: "wondershare-filmora-lifetime-ai-credits",
    categoryId: "creative",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    validityText: "Lifetime + 2600 AI Credits",
    shortDescription: "Easy video editor with AI credits.",
    features: ["Lifetime access", "2600 AI credits", "Fast editing workflow"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 60,
    isActive: true,
  },
  {
    name: "Canva Lifetime Access",
    slug: "canva-lifetime-access",
    categoryId: "creative",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    shortDescription: "Lifetime Canva access (availability varies).",
    features: ["Templates & design", "Fast social content", "Contact for details"],
    thumbnailPath: "/products/canva.jpeg",
    watermarkLogoPath: "/logos/canva.svg",
    sortOrder: 70,
    isActive: true,
  },
  {
    name: "Freepik Shared",
    slug: "freepik-shared-18000-ai-credits-month",
    categoryId: "creative",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    validityText: "18,000 AI Credits/Month",
    shortDescription: "Shared plan with monthly AI credits.",
    features: ["Asset library", "AI credits/month", "Contact for current slots"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 80,
    isActive: true,
  },
  {
    name: "Premium Design Assets + AI Image Generation",
    slug: "premium-design-assets-ai-image-generation",
    categoryId: "creative",
    status: "ON_REQUEST",
    pricingType: "CONTACT",
    shortDescription: "Custom asset packs and AI image generation requests.",
    features: ["On request", "Custom deliverables", "Fast turnaround"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 90,
    isActive: true,
  },

  // =======================
  // VPN Services
  // =======================
  {
    name: "Surfshark VPN",
    slug: "surfshark-vpn-2-years",
    categoryId: "vpn",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    validityText: "2 Years",
    shortDescription: "Fast VPN with long-term plan options.",
    features: ["Secure browsing", "Multiple servers", "Contact for pricing"],
    thumbnailPath: "/products/surfshark.png",
    watermarkLogoPath: "/logos/surfshark.svg",
    sortOrder: 10,
    isActive: true,
  },
  {
    name: "NordVPN",
    slug: "nordvpn-600-days-sale",
    categoryId: "vpn",
    status: "ON_SALE",
    pricingType: "CONTACT",
    validityText: "600+ Days",
    shortDescription: "NordVPN long plan (sale).",
    features: ["Secure browsing", "Fast servers", "Sale pricing via contact"],
    thumbnailPath: "/products/nord.png",
    watermarkLogoPath: "/logos/nordvpn.svg",
    sortOrder: 20,
    isActive: true,
  },
  {
    name: "NordVPN",
    slug: "nordvpn-915-days-2-devices",
    categoryId: "vpn",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    validityText: "915 Days",
    deviceLimitText: "2 Devices",
    shortDescription: "NordVPN plan for two devices.",
    features: ["915 days validity", "2 devices", "Contact for details"],
    thumbnailPath: "/products/nord.png",
    watermarkLogoPath: "/logos/nordvpn.svg",
    sortOrder: 30,
    isActive: true,
  },
  {
    name: "IPVanish VPN",
    slug: "ipvanish-vpn-1-year-unlimited-devices",
    categoryId: "vpn",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    validityText: "1 Year",
    deviceLimitText: "Unlimited Devices",
    shortDescription: "VPN with unlimited device support.",
    features: ["Unlimited devices", "1 year plan", "Contact for availability"],
    thumbnailPath: "/products/ipvanish.png",
    watermarkLogoPath: "/logos/ipvanish.svg",
    sortOrder: 40,
    isActive: true,
  },
  {
    name: "PIA VPN (Private Internet Access)",
    slug: "pia-vpn-2-years-unlimited-devices",
    categoryId: "vpn",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    validityText: "2+ Years",
    deviceLimitText: "Unlimited Devices",
    shortDescription: "PIA VPN long plan (unlimited devices).",
    features: ["Unlimited devices", "Strong privacy", "Contact for plan details"],
    thumbnailPath: "/products/pia.jpeg",
    watermarkLogoPath: "/logos/pia.svg",
    sortOrder: 50,
    isActive: true,
  },
  {
    name: "Warp+ VPN",
    slug: "warp-plus-vpn-lifetime-5-devices",
    categoryId: "vpn",
    status: "AVAILABLE",
    pricingType: "FIXED",
    priceAmount: 1000,
    billingPeriod: "ONE_TIME",
    validityText: "Lifetime",
    deviceLimitText: "5 Devices",
    shortDescription: "Warp+ VPN lifetime plan for 5 devices.",
    features: ["Lifetime access", "5 devices", "Fast setup"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 60,
    isActive: true,
  },
  {
    name: "Avast SecureLine VPN",
    slug: "avast-secureline-vpn-1-month",
    categoryId: "vpn",
    status: "AVAILABLE",
    pricingType: "FIXED",
    priceAmount: 500,
    billingPeriod: "ONE_TIME",
    validityText: "1 Month",
    shortDescription: "Monthly SecureLine VPN plan.",
    features: ["1 month plan", "Quick activation", "Trusted brand"],
    thumbnailPath: "/products/avast-secureline.jpeg",
    watermarkLogoPath: "/logos/avast-secureline.svg",
    sortOrder: 70,
    isActive: true,
  },
  {
    name: "ESET VPN",
    slug: "eset-vpn-various-plans",
    categoryId: "vpn",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    validityText: "Various plans",
    shortDescription: "ESET VPN plan options.",
    features: ["Multiple plans", "Secure browsing", "Contact for pricing"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 80,
    isActive: true,
  },
  {
    name: "CyberGhost VPN",
    slug: "cyberghost-vpn",
    categoryId: "vpn",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    shortDescription: "CyberGhost VPN plans available.",
    features: ["Privacy protection", "Server options", "Contact for details"],
    thumbnailPath: "/products/cyberghost.jpeg",
    watermarkLogoPath: "/logos/cyberghost.svg",
    sortOrder: 90,
    isActive: true,
  },
  {
    name: "HMA VPN",
    slug: "hma-vpn-till-2027",
    categoryId: "vpn",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    validityText: "Till 2027",
    shortDescription: "HMA VPN long validity plan.",
    features: ["Till 2027", "Fast setup", "Contact for current availability"],
    thumbnailPath: "/products/hma.png",
    watermarkLogoPath: "/logos/hma.svg",
    sortOrder: 100,
    isActive: true,
  },
  {
    name: "Eva VPN",
    slug: "eva-vpn-1-month",
    categoryId: "vpn",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    validityText: "1 Month",
    shortDescription: "Monthly VPN plan.",
    features: ["1 month validity", "Basic privacy", "Contact for details"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 110,
    isActive: true,
  },
  {
    name: "VeePN",
    slug: "veepn",
    categoryId: "vpn",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    shortDescription: "VeePN plans (contact for availability).",
    features: ["VPN privacy", "Plan options", "Contact for pricing"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 120,
    isActive: true,
  },

  // =======================
  // Utility Tools
  // =======================
  {
    name: "WiseCare 365 + Tools",
    slug: "wisecare-365-tools",
    categoryId: "utilities",
    status: "AVAILABLE",
    pricingType: "FIXED",
    priceAmount: 2000,
    billingPeriod: "ONE_TIME",
    shortDescription: "PC cleanup and optimization suite.",
    features: ["Cleanup tools", "Optimization", "System utilities"],
    thumbnailPath: "/products/wise-care-365.jpeg",
    watermarkLogoPath: "/logos/wise-care-365.svg",
    sortOrder: 10,
    isActive: true,
  },
  {
    name: "IObit Driver Booster",
    slug: "iobit-driver-booster",
    categoryId: "utilities",
    status: "AVAILABLE",
    pricingType: "FIXED",
    priceAmount: 1000,
    billingPeriod: "ONE_TIME",
    shortDescription: "Driver update and backup tool.",
    features: ["Update drivers", "Improve stability", "Easy automation"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 20,
    isActive: true,
  },
  {
    name: "Wondershare UniConverter",
    slug: "wondershare-uniconverter",
    categoryId: "utilities",
    status: "AVAILABLE",
    pricingType: "FIXED",
    priceAmount: 1500,
    billingPeriod: "ONE_TIME",
    shortDescription: "Video conversion and compression tool.",
    features: ["Convert formats", "Compress videos", "Fast processing"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 30,
    isActive: true,
  },
  {
    name: "Internet Download Manager (IDM)",
    slug: "internet-download-manager-idm-lifetime",
    categoryId: "utilities",
    status: "CONTACT_ONLY",
    pricingType: "CONTACT",
    validityText: "Lifetime",
    shortDescription: "Fast downloader with resume support (lifetime).",
    features: ["Super-fast speeds", "Resume broken downloads", "Works on major browsers"],
    thumbnailPath: "/products/idm.jpeg",
    watermarkLogoPath: "/logos/idm.svg",
    sortOrder: 40,
    isActive: true,
  },
  {
    name: "Proxifier",
    slug: "proxifier-till-2069",
    categoryId: "utilities",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    validityText: "Till 2069",
    shortDescription: "Proxy tool with long-term validity.",
    features: ["Proxy routing", "App-level control", "Contact for plan"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 50,
    isActive: true,
  },
  {
    name: "IObit Advanced SystemCare",
    slug: "iobit-advanced-systemcare",
    categoryId: "utilities",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    shortDescription: "System tune-up and cleanup suite.",
    features: ["Optimize system", "Clean junk", "Easy maintenance"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 60,
    isActive: true,
  },
  {
    name: "EaseUS RecExperts",
    slug: "easeus-recexperts",
    categoryId: "utilities",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    shortDescription: "Screen recording tool for tutorials and demos.",
    features: ["Screen recording", "Audio capture", "Contact for details"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 70,
    isActive: true,
  },
  {
    name: "EaseUS Partition Master",
    slug: "easeus-partition-master",
    categoryId: "utilities",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    shortDescription: "Disk partition and management tool.",
    features: ["Partition management", "Disk optimization", "Contact for plan"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 80,
    isActive: true,
  },
  {
    name: "AnyViewer Professional",
    slug: "anyviewer-professional",
    categoryId: "utilities",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    shortDescription: "Remote desktop and device access tool.",
    features: ["Remote access", "Device management", "Contact for details"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 90,
    isActive: true,
  },
  {
    name: "Action Screen Recorder",
    slug: "action-screen-recorder",
    categoryId: "utilities",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    shortDescription: "Screen recorder for tutorials and quick captures.",
    features: ["Record screen", "Simple UI", "Contact for availability"],
    thumbnailPath: "/products/action-screen-recorder.jpeg",
    watermarkLogoPath: "/logos/action-screen-recorder.svg",
    sortOrder: 100,
    isActive: true,
  },
  {
    name: "EaseUS Fixo",
    slug: "easeus-fixo",
    categoryId: "utilities",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    shortDescription: "Repair tool for crashes, freezes & boot issues.",
    features: [
      "Fixes system & software errors",
      "Repairs crashes, freezes & boot issues",
      "Saves time & data",
    ],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 110,
    isActive: true,
  },

  // =======================
  // Data & Research Tools
  // =======================
  {
    name: "Stellar Data Recovery",
    slug: "stellar-data-recovery",
    categoryId: "data",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    shortDescription: "Data recovery tools (contact for plans).",
    features: ["Recover files", "Multiple scenarios", "Contact for availability"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 10,
    isActive: true,
  },
  {
    name: "SysTools (All Software)",
    slug: "systools-all-software",
    categoryId: "data",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    shortDescription: "SysTools suite availability varies.",
    features: ["Multiple tools", "Professional utilities", "Contact for details"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 20,
    isActive: true,
  },
  {
    name: "EndNote (Latest Version)",
    slug: "endnote-latest",
    categoryId: "data",
    status: "AVAILABLE",
    pricingType: "FIXED",
    priceAmount: 1000,
    billingPeriod: "ONE_TIME",
    shortDescription: "Reference management for researchers.",
    features: ["Citations & bibliography", "Research workflow", "Latest version"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 30,
    isActive: true,
  },
  {
    name: "Encryption Tools",
    slug: "encryption-tools",
    categoryId: "data",
    status: "CONTACT_ONLY",
    pricingType: "CONTACT",
    shortDescription: "Encryption utilities (contact for options).",
    features: ["Security tools", "Multiple options", "Contact for availability"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 40,
    isActive: true,
  },

  // =======================
  // Writing Tools
  // =======================
  {
    name: "QuillBot",
    slug: "quillbot-monthly-1-device",
    categoryId: "writing",
    status: "AVAILABLE",
    pricingType: "RECURRING",
    priceAmount: 700,
    billingPeriod: "MONTH",
    deviceLimitText: "1 Device",
    shortDescription: "Monthly writing assistant plan.",
    features: ["Paraphrasing", "Grammar tools", "1-device plan"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 10,
    isActive: true,
  },
  {
    name: "Grammarly",
    slug: "grammarly-yearly",
    categoryId: "writing",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    validityText: "Yearly",
    shortDescription: "Grammar and writing enhancement.",
    features: ["Grammar checks", "Tone suggestions", "Yearly plan"],
    thumbnailPath: "/products/grammarly.png",
    watermarkLogoPath: "/logos/grammarly.svg",
    sortOrder: 20,
    isActive: true,
  },

  // =======================
  // Entertainment & Media
  // =======================
  {
    name: "YouTube Premium",
    slug: "youtube-premium",
    categoryId: "media",
    status: "AVAILABLE",
    pricingType: "FIXED",
    priceAmount: 1000,
    billingPeriod: "ONE_TIME",
    shortDescription: "Premium subscription access.",
    features: ["Ad-free", "Background play", "Premium features"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 10,
    isActive: true,
  },
  {
    name: "GTA V + Other Games",
    slug: "gta-v-other-games",
    categoryId: "media",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    shortDescription: "Game availability varies (contact for options).",
    features: ["GTA V available", "Other games", "Contact for details"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 20,
    isActive: true,
  },
  {
    name: "Epic Games Free Giveaways",
    slug: "epic-games-free-giveaways",
    categoryId: "media",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    shortDescription: "Join the channel for giveaway updates.",
    features: ["Weekly updates", "Free game drops", "Contact to join channel"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 30,
    isActive: true,
  },
  {
    name: "Spotify",
    slug: "spotify",
    categoryId: "media",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    shortDescription: "Spotify subscriptions (contact for plans).",
    features: ["Streaming music", "Premium options", "Contact for details"],
    thumbnailPath: "/products/spotify.png",
    watermarkLogoPath: "/logos/spotify.svg",
    sortOrder: 40,
    isActive: true,
  },
  {
    name: "Netflix",
    slug: "netflix",
    categoryId: "media",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    shortDescription: "Netflix subscription access (contact for plans).",
    features: ["Streaming", "Multiple plans", "Contact for availability"],
    thumbnailPath: "/products/netflix.png",
    watermarkLogoPath: "/logos/netflix.svg",
    sortOrder: 50,
    isActive: true,
  },

  // =======================
  // Hardware & Gadgets
  // =======================
  {
    name: "3D Crystal Lamps",
    slug: "3d-crystal-lamps-limited",
    categoryId: "hardware",
    status: "LIMITED",
    pricingType: "CONTACT",
    shortDescription: "Limited stock decorative crystal lamps.",
    features: ["Limited stock", "Gift item", "Contact to confirm availability"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 10,
    isActive: true,
  },
  {
    name: "Smart Watch",
    slug: "smart-watch",
    categoryId: "hardware",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    shortDescription: "Smart watch availability varies.",
    features: ["Daily use", "Multiple models", "Contact for details"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 20,
    isActive: true,
  },
  {
    name: "Soundcore Life Q35 (Like New)",
    slug: "soundcore-life-q35-like-new",
    categoryId: "hardware",
    status: "CONTACT_ONLY",
    pricingType: "CONTACT",
    shortDescription: "Like-new headphones (contact for price).",
    features: ["Like new condition", "Limited availability", "Contact for details"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 30,
    isActive: true,
  },
  {
    name: "Self-Defense Knife",
    slug: "self-defense-knife",
    categoryId: "hardware",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    shortDescription: "Availability varies by stock.",
    features: ["Stock-based", "Contact to confirm availability", "Demo listing"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 40,
    isActive: true,
  },
  {
    name: "DLA6 Cooling Fan",
    slug: "dla6-cooling-fan",
    categoryId: "hardware",
    status: "AVAILABLE",
    pricingType: "FIXED",
    priceAmount: 2300,
    billingPeriod: "ONE_TIME",
    shortDescription: "Cooling fan unit.",
    features: ["Cooling support", "Hardware accessory", "Contact for details"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 50,
    isActive: true,
  },

  // =======================
  // Special Offers
  // =======================
  {
    name: "Package Deals & Combo Discounts",
    slug: "package-deals-combo-discounts",
    categoryId: "specials",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    shortDescription: "Bundle deals across multiple products.",
    features: ["Discount bundles", "Custom combos", "Contact for quote"],
    thumbnailPath: "/products/bundle.png",
    watermarkLogoPath: "",
    sortOrder: 10,
    isActive: true,
  },
  {
    name: "Custom AI Images / Design Requests",
    slug: "custom-ai-images-design-requests",
    categoryId: "specials",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    shortDescription: "Custom AI images and design work on request.",
    features: ["Custom requests", "Fast delivery", "Contact to discuss"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 20,
    isActive: true,
  },
  {
    name: "ChatGPT Plus (1 Month)",
    slug: "chatgpt-plus-1-month-personal",
    categoryId: "specials",
    status: "LIMITED",
    pricingType: "CONTACT",
    validityText: "1 Month (Personal account)",
    shortDescription: "Premium AI features for a month.",
    features: ["Faster responses", "Priority access", "Advanced features"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 30,
    isActive: true,
  },
  {
    name: "Google AI Pro Plan (1 Year)",
    slug: "google-ai-pro-plan-1-year",
    categoryId: "specials",
    status: "LIMITED",
    pricingType: "CONTACT",
    validityText: "1 Year",
    deliveryText: "Added to your email",
    shortDescription: "Premium AI tools + 2TB Google Drive.",
    features: [
      "Gemini Pro + Veo (90 videos/month)",
      "Unlimited AI images + text",
      "2TB Drive on your email",
    ],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 40,
    isActive: true,
  },
  {
    name: "Special Sora 2 + VPN Invite Offer",
    slug: "sora-2-vpn-invite-offer",
    categoryId: "specials",
    status: "LIMITED",
    pricingType: "CONTACT",
    shortDescription: "Invite offer + 2 months Surfshark VPN.",
    features: ["Invite from Pro plan", "Includes 2 months Surfshark", "Limited stock"],
    thumbnailPath: "/products/placeholder.png",
    watermarkLogoPath: "",
    sortOrder: 50,
    isActive: true,
  },
  {
    name: "LinkedIn Premium (3 Months)",
    slug: "linkedin-premium-3-months",
    categoryId: "specials",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    validityText: "3 Months",
    deliveryText: "Delivered to your email",
    shortDescription: "Premium LinkedIn benefits for 3 months.",
    features: ["See profile viewers", "InMail credits", "Learning courses"],
    thumbnailPath: "/products/linkedin.png",
    watermarkLogoPath: "/logos/linkedin-premium.svg",
    sortOrder: 60,
    isActive: true,
  },
  {
    name: "LinkedIn Premium Career (12 Months)",
    slug: "linkedin-premium-career-12-months",
    categoryId: "specials",
    status: "AVAILABLE",
    pricingType: "CONTACT",
    validityText: "12 Months",
    deliveryText: "Delivered to your email",
    shortDescription: "Career plan for a full year.",
    features: ["InMail to recruiters", "Applicant insights", "LinkedIn Learning"],
    thumbnailPath: "/products/linkedin.png",
    watermarkLogoPath: "/logos/linkedin-premium.svg",
    sortOrder: 70,
    isActive: true,
  },
] as const;
```

### Notes for the AI agent implementing seeds
- Replace `/logos/placeholder.svg` with a real placeholder asset or allow empty watermark.
- Ensure enums match the Prisma schema names exactly.
- Some items appear in the old code already; the seed should overwrite/merge cleanly.

## A.4 Announcement / PSA content (optional section)
Your message includes a “PSA” about Google Cloud AI credits scams. This is **not a product**, so implement it as:

- A new optional section: `AnnouncementsSection`
- OR a special “info card” inside `TrustedSupport`

Suggested content (safe wording):
- Title: “PSA: Avoid fake ‘AI credits’ sellers”
- Bullets:
  - “Google offers free trials/credits through official signup.”
  - “Never pay third parties for ‘exclusive credits’.”
  - “Use official documentation for eligibility and region requirements.”

---

# Appendix B — Implementation checklist (upgrade from current repo)

1) **Disable static export**
   - Update `next.config.mjs`:
     - remove `output: "export"`
     - remove `images.unoptimized` (optional)
2) **Add database + Prisma**
   - `prisma/schema.prisma` + migrations
3) **Add seed script**
   - Seeds categories/products/admin user
4) **Refactor `ShopByCategory`**
   - Accept `categories` + `products` as props instead of importing from `src/data/shop.ts`
   - Render product thumbnail + details + badges
5) **Build Admin Panel**
   - Auth + routes + CRUD UI
6) **Keep existing branding**
   - Do not modify `src/data/site.ts` contact values
   - Keep `IntroSplash.tsx` as-is

---

End of spec.
