# TechShop Pro — Low‑Level Documentation (Edit Anything)

This document is written to help you edit **anything** in the TechShop Pro project, even if you’re not very experienced with Next.js.

The project is a **static-export Next.js (App Router) storefront**.
That means:

- It deploys cleanly on **Vercel Free/Hobby** as a **static site**.
- There is **no backend** in this repo.
- You should avoid adding server-only features unless you remove static export.

---

## 1) Quick start (run locally)

### Requirements

- Node.js **20** recommended (Node 18+ works, but pinning Node 20 is safer for deployments).
- npm (comes with Node).

### Install

```bash
npm install
```

### Run dev server

```bash
npm run dev
```

Open:

- http://localhost:3000

### Production build (the same build Vercel runs)

```bash
npm run build
```

### Preview the exported site

This project exports a static site into `out/`.

```bash
npm run preview
```

---

## 2) Deploy to Vercel (Free tier)

### Deploy from GitHub (recommended)

1. Push the project to GitHub.
2. In Vercel: **New Project → Import** your repo.
3. Framework preset: **Next.js**.
4. Deploy.

### Important Vercel settings

- **Node.js Version:** set to **20.x** in the Vercel project settings.
- **Environment Variables (recommended):**
  - `NEXT_PUBLIC_SITE_URL` = `https://your-domain.com`

> Why set `NEXT_PUBLIC_SITE_URL`?
> It ensures SEO metadata + sitemap links use the correct domain.

---

## 3) Project structure (what lives where)

```
public/
  logos/                    # watermark logos used on product cards
  og.png                    # social preview image
  icon.png                  # favicon/app icon
  whatsapp-group-qr.png     # WhatsApp group QR image
  techshoppro-logo.webp     # hero logo (right side)

src/
  app/
    layout.tsx              # global layout + SEO metadata + intro splash
    page.tsx                # home page sections order
    robots.ts               # robots.txt generator
    sitemap.ts              # sitemap.xml generator
    not-found.tsx           # 404 page

  components/
    NavBar.tsx              # top navigation
    Hero.tsx                # big headline section
    ShopByCategory.tsx      # category grid + modal popup
    TrustedSupport.tsx      # support cards
    ContactSection.tsx      # phone/email + WhatsApp group section
    Footer.tsx              # footer

    IntroSplash.tsx         # 4s loading overlay
    ParticleBackground.tsx  # canvas particle animation
    ScrollProgress.tsx      # top scroll progress bar

    icons.tsx               # icon map used by categories
    LogoMark.tsx            # small logo mark used in navbar/footer

  data/
    site.ts                 # store name, contact info, URLs
    shop.ts                 # categories + products

  lib/
    utils.ts                # cn() helper and tiny helpers

  styles/
    globals.css             # theme tokens + global styles
```

---

## 4) The “data files” that drive almost everything

If you only want to change text + products, you usually only touch **2 files**:

### A) Store name, WhatsApp, contact details

File: `src/data/site.ts`

Edit these:

- `CONTACT.phoneDisplay` → shown on the site
- `CONTACT.phoneE164` → WhatsApp number in international format (no `+`)
- `CONTACT.email` → email shown on the site

WhatsApp group:

- `WHATSAPP_GROUP_LINK` → your invite link
- `WHATSAPP_GROUP_QR` → the image path in `/public`

Base URL:

- `site.url` is used for metadata + sitemap.
- Best practice: set `NEXT_PUBLIC_SITE_URL` in Vercel.

### B) Categories + products

File: `src/data/shop.ts`

#### Add / remove a category

Categories are defined in the `categories` array.

Each category has:

- `id` (must be unique)
- `name`
- `description`
- `iconName` (must exist in `src/components/icons.tsx`)

#### Add / remove a product

Products are defined in the `products` array.

Each product has:

- `id` (unique)
- `name`
- `categoryId` (must match an existing category `id`)
- `logo` (path to a file in `public/`)
- `isActive` (`true` means it appears in the modal)

Logos:

- Put watermark logos in: `public/logos/`
- SVG is best (small + sharp)

---

## 5) Editing the page layout (what appears on the homepage)

File: `src/app/page.tsx`

This file decides the order of sections.

Example (conceptually):

```tsx
return (
  <>
    <Hero />
    <ShopByCategory />
    <TrustedSupport />
    <ContactSection />
  </>
);
```

- To remove a section: delete that component line.
- To reorder: move the lines.
- To add a new section:
  1. Create a new component file inside `src/components/`
  2. Import it into `page.tsx`
  3. Render it.

---

## 6) Editing each section (where to edit what)

### Nav bar
File: `src/components/NavBar.tsx`

- Change button labels
- Change WhatsApp links
- Update logo mark usage

### Hero section (big headline)
File: `src/components/Hero.tsx`

- Edit the headline text
- Replace the hero logo image:
  - Replace `public/techshoppro-logo.webp` **or** change the `<Image src="..." />` path.

### Shop by Category
File: `src/components/ShopByCategory.tsx`

- Card UI for categories
- Popup/modal UI
- Product card watermark background uses `p.logo`

### Trusted Support
File: `src/components/TrustedSupport.tsx`

- The 3 support cards (WhatsApp / Call / Email)

### Contact Section
File: `src/components/ContactSection.tsx`

- WhatsApp group section + QR image

### Footer
File: `src/components/Footer.tsx`

- Footer links and disclaimers

---

## 7) Styling: theme + colors + spacing

### Global styles
File: `src/styles/globals.css`

This is where you change:

- Background color
- Text colors
- Gold glow effects
- Global animations

### Tailwind config
File: `tailwind.config.ts`

- Theme tokens
- Extended colors
- Content scanning paths

If you change colors, do it in **one place** (Tailwind theme or CSS variables) so the whole site updates consistently.

---

## 8) Intro splash (loader) and particle animation

### Intro splash
File: `src/components/IntroSplash.tsx`

Key settings:

- `DURATION_MS` (how long splash stays)
- Text scramble settings

### Particle background
File: `src/components/ParticleBackground.tsx`

You can tune:

- Particle count (density)
- Speed
- Line distance (how many connections)
- Glow strength

Performance tips (for slow phones):

- reduce `maxParticles`
- increase `densityDivisor`
- reduce `maxDistance`
- disable glow

---

## 9) Static export rules (very important)

This project is set up for **static export**.

That means:

✅ OK:

- Static pages
- Client components (`"use client"`)
- Static images in `public/`

⚠️ Avoid (unless you change the deployment mode):

- API routes that need a server
- Server Actions
- Runtime server-only logic
- Dynamic rendering that depends on `headers()` / `cookies()` at runtime

If you want backend features later, you can remove static export (`output: "export"`) and redeploy as a normal Next.js app.

---

## 10) Troubleshooting (common problems)

### A) Vercel build fails with TypeScript “possibly null” errors

This repo uses **TypeScript strict mode**, and Vercel runs type-checking during build.

If you access a DOM ref inside a nested function (like inside `requestAnimationFrame`, `resize`, timers, etc.), TypeScript sometimes refuses to trust your earlier `if (!ref) return;` checks.

**Safe pattern:** create a new non-null constant after the guard.

```ts
const el0 = ref.current;
if (!el0) return;
const el = el0; // el is now non-null for nested closures
```

### B) My site URL in sitemap/SEO is wrong

Set this env var in Vercel:

- `NEXT_PUBLIC_SITE_URL` = `https://your-domain.com`

### C) Images don’t show after deploy

- Ensure images are inside `public/` and referenced with `/filename.ext`.
- Keep filenames lowercase to avoid case sensitivity issues on Linux hosts.

---

## 11) Making “big changes” safely (recommended workflow)

1. Change **data** first (`src/data/site.ts`, `src/data/shop.ts`).
2. Run `npm run dev` to check visually.
3. Run `npm run build` before pushing.
4. Push to GitHub.
5. Deploy on Vercel.

---

## 12) If you want me to generate a clean “blank template”

If you want, I can restructure the repo so it’s easier to reuse for multiple clients:

- Move all business data into a single `src/config/` folder
- Add a `CHANGELOG.md`
- Add `docs/` folder with screenshots placeholders

