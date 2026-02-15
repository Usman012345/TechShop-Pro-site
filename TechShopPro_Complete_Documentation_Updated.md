# TechShop Pro — Complete Low‑Level Documentation (Updated for Vercel + Hero Logo Layout)

> This is the full “how it works” + “how to edit anything” guide for the TechShop Pro one‑page storefront project.
>
> **This version includes the latest fixes:**
> - Vercel build fix for TypeScript strict mode (`ctx` possibly null)
> - Hero “textbox” slightly smaller (reduced padding)
> - Hero logo nudged to the **far right** of the textbox (less “center-right” feel)

---

## Contents
1. Overview
2. Tech Stack & Deployment Mode
3. Getting Started (Install / Run / Build / Preview)
4. Deploying on Vercel Free Tier
5. Folder & File Map (Where Everything Lives)
6. Edit Guide (Brand / Content / UI / Animations / Data)
7. Particle System (Performance + Visuals)
8. Intro Splash Loader (4s, full screen, instant start)
9. Styling System (Theme tokens, Tailwind, utilities)
10. SEO (Metadata, OG image, sitemap, robots)
11. Recipes (Common edits step‑by‑step)
12. Performance Checklist (Mobile “no jitter”)
13. Static Export Limitations (Important gotchas)
14. Appendix: Component responsibilities

---

## 1) Overview

This repository is a **single‑page, mobile‑first storefront** built with **Next.js (App Router) + TypeScript + Tailwind CSS**.

Key features:
- **4‑second full‑screen Intro Splash** with **gold dots + connecting lines**
- **Smooth progress bar** (CSS-driven, no stepping)
- **Optimized particle canvas background** (adaptive quality, mobile-friendly)
- One-page scroll sections (Hero, Categories modal, Support, Contact, Footer)
- WhatsApp contact button + WhatsApp group QR
- Fully static deploy (Vercel Free tier friendly)

---

## 2) Tech Stack & Deployment Mode

### Framework
- Next.js (App Router)
- React 18
- TypeScript

### Styling
- Tailwind CSS
- Global theme tokens in `src/styles/globals.css`
- Tailwind config in `tailwind.config.ts`

### Deployment mode: Static Export
This project uses:
- `output: "export"` (in `next.config.mjs`)
- `trailingSlash: true`
- `images.unoptimized: true` (required for static export)

**Important implication:**  
No server runtime features:
- No API routes
- No Server Actions
- No dynamic server rendering

Everything must be static + client-safe.

---

## 3) Getting Started (Install / Run / Build / Preview)

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
Open: `http://localhost:3000`

### Build (static export to `/out`)
```bash
npm run build
```

### Preview production output
```bash
npm run preview
```
This builds and serves the `out/` folder.

---

## 4) Deploying on Vercel Free Tier

### Recommended (GitHub → Vercel)
1. Push repo to GitHub
2. Vercel → **New Project** → Import repo
3. Vercel detects Next.js automatically
4. Deploy

### If Vercel asks for build settings
- **Build Command:** `npm run build`
- **Output Directory:** `out`

### Recommended env var
Set:
- `NEXT_PUBLIC_SITE_URL` = `https://your-domain.com`

If not set:
- the app will fallback to `VERCEL_URL` if present, else `https://example.com`

### Troubleshooting: Vercel build fails (TypeScript strict)
If you see:
- `Type error: 'ctx' is possibly 'null'` in `src/components/ParticleBackground.tsx`

**Fix (already applied in this repo):**
- `const ctx0 = canvas.getContext(...)`
- `if (!ctx0) return;`
- `const ctx: CanvasRenderingContext2D = ctx0;`

If Vercel still fails after you updated code:
1. Make sure Vercel is deploying the **latest commit**.
2. Vercel → **Deployments → Redeploy → Clear cache** (important).
3. Confirm `package.json` pins `next` and Node is `>= 18`.

---

## 5) Folder & File Map

```
public/
  techshoppro-logo.webp          # brand logo used in Hero (right side)
  techshoppro-logo.jpg           # backup
  og.png                         # OpenGraph social image
  whatsapp-group-qr.png          # WhatsApp group QR
  noise.png                      # subtle noise texture
  logos/                         # product watermark logos (SVG recommended)

src/
  app/
    layout.tsx                   # global layout + metadata + IntroSplash + NavBar + Footer
    page.tsx                     # main one-page section ordering
    sitemap.ts                   # sitemap.xml
    robots.ts                    # robots.txt
    icon.png                     # favicon/app icon
    not-found.tsx                # 404

  components/
    IntroSplash.tsx              # 4s full-screen loader (instant-start feel)
    ParticleBackground.tsx       # optimized gold particle network canvas
    Hero.tsx                     # headline + large right-side logo + CTAs
    NavBar.tsx                   # sticky nav
    ShopByCategory.tsx           # categories + modal product list
    TrustedSupport.tsx           # support cards
    ContactSection.tsx           # WhatsApp group + QR + contact info
    ScrollProgress.tsx           # scroll indicator line at top
    Footer.tsx                   # footer content
    LogoMark.tsx                 # small inline SVG mark used in nav/footer
    Section.tsx                  # helper wrapper
    icons.tsx                    # icon mapping (lucide)

  data/
    site.ts                      # store identity + contact + WhatsApp helpers
    shop.ts                      # categories + products

  lib/
    utils.ts                     # cn() helper (className merging)

  styles/
    globals.css                  # theme tokens + utilities + animations
```

---

## 6) Edit Guide (How to edit anything)

### 6.1 Store name, SEO text, URL
**File:** `src/data/site.ts`

Edit:
- `site.name`
- `site.description`
- `site.url` (recommended: via env var)

### 6.2 Hero headline text
**File:** `src/components/Hero.tsx`

Look for the `h1` text (uses `{site.name} premium storefront`).
You can rewrite the headline however you want.

### 6.3 Hero logo (large, right side — aligned to the far right)
**Files:**
- Logo image: `public/techshoppro-logo.webp` (preferred)
- Layout: `src/components/Hero.tsx`

To replace logo:
1. Export your logo as WebP and replace `public/techshoppro-logo.webp`
2. Keep same filename OR update `<Image src="/techshoppro-logo.webp" ... />`

#### How the “far right” alignment works
In `Hero.tsx` the logo container is pushed to the far right using:
- `ml-auto` (takes remaining flex space and pushes the logo right)
- a small negative right margin to nudge it closer to the textbox edge:
  - `-mr-1 sm:-mr-2`
- the image is right-aligned *inside* the logo box:
  - `object-right`
- reduced inner padding so it doesn’t look “centered”:
  - `p-1 pr-0`

If you want the logo to sit even closer to the edge:
- change `-mr-1` → `-mr-2` (and `sm:-mr-2` → `sm:-mr-3`)

### 6.4 Reduce/Increase the hero “textbox” size
The hero card padding controls the “textbox size”.

**File:** `src/components/Hero.tsx`

Current padding:
- `p-6 md:p-9`

To make it smaller:
- `p-5 md:p-8`

To make it larger:
- `p-7 md:p-10`

### 6.5 Navigation links/buttons
**File:** `src/components/NavBar.tsx`

To add a new section link:
1. Add an element with `id="my-section"` in your section component
2. Add a new button/link:
```tsx
<a href="#my-section" className="...">My Section</a>
```

Mobile nav uses horizontal scrolling (stable height, no wrap jitter).

### 6.6 Section order (one-page layout)
**File:** `src/app/page.tsx`

Reorder, add, or remove components there.

### 6.7 Categories and products
**File:** `src/data/shop.ts`

#### Categories
```ts
{
  id: "vpn",
  name: "VPN Services",
  description: "…",
  iconName: "Globe",
}
```
Rules:
- `id` must be unique
- `iconName` must exist in `src/components/icons.tsx`

#### Products
```ts
{
  id: "vpn-nord",
  name: "NordVPN",
  categoryId: "vpn",
  logo: "/logos/nordvpn.svg",
  isActive: true
}
```
Rules:
- `categoryId` must match a category
- `logo` must exist under `public/`
- set `isActive: false` to hide without deleting

#### Product watermark logos
Put SVGs in:
- `public/logos/`

SVGs render sharper and are faster than large PNGs.

### 6.8 Category modal UI / behavior
**File:** `src/components/ShopByCategory.tsx`

Change:
- card layout
- modal sizing (`max-h-[78svh]`)
- scroll behavior
- close behavior (ESC, backdrop click)

### 6.9 WhatsApp, phone number, email, group link, QR
**File:** `src/data/site.ts`

Contact:
```ts
export const CONTACT = {
  phoneDisplay: "03289659525",
  phoneE164: "923289659525",
  email: "you@email.com",
};
```
**Note:** `phoneE164` must be digits only (no `+`).

WhatsApp group:
- `WHATSAPP_GROUP_LINK`
- `WHATSAPP_GROUP_QR` → points to `/whatsapp-group-qr.png`

Replace QR image:
- Replace `public/whatsapp-group-qr.png`

Default WhatsApp message text appears in:
- `Hero.tsx`, `NavBar.tsx`, `TrustedSupport.tsx`, `ContactSection.tsx`, `ShopByCategory.tsx`

### 6.10 Footer
**File:** `src/components/Footer.tsx`

Edit links + text there.

---

## 7) Particle System (Performance + Visuals)

**File:** `src/components/ParticleBackground.tsx`

### What it does
- Draws a network of moving golden dots
- Connects nearby dots with lines
- Uses **adaptive quality** for mobile performance:
  - caps DPR
  - clamps particle counts
  - uses grid acceleration for neighbor checks
  - avoids expensive blur operations

### Most important tuning knobs
- `speed` (movement speed)
- `maxDistance` (line connection distance)
- `lineOpacity` (brightness of lines)
- `particleOpacity` (brightness of dots)
- `minParticles / maxParticles / densityDivisor` (performance)

### If mobile still lags on some devices
- Lower `maxParticles`
- Lower `maxDistance`
- Increase `densityDivisor`
- Cap DPR harder (already done automatically)

---

## 8) Intro Splash Loader (4s, full-screen, instant start)

**File:** `src/components/IntroSplash.tsx`

### Key timing values
- `DURATION_MS = 4000`
- `REVEAL_MS` and `FADE_MS` determine how the final “resolve” feels

### Smooth progress bar (no jumps)
Progress bar uses CSS keyframes:
- `src/styles/globals.css` → `@keyframes splash-progress`

This prevents JS timer stepping during heavy animation frames.

### “Starts immediately” feel
A lightweight CSS animated fallback runs until the canvas reports first frame:
- `.splash-fallback-layer` in `globals.css`
- hidden once `onReady` fires from `ParticleBackground`

---

## 9) Styling System (Theme tokens, Tailwind, utilities)

### Theme tokens
**File:** `src/styles/globals.css`
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

Change these to re-theme the entire site.

### Tailwind mapping
**File:** `tailwind.config.ts`  
Maps these tokens into Tailwind color utilities.

### Custom utilities
**File:** `src/styles/globals.css`
- `.no-scrollbar` (hide scrollbars)
- `.noise` (subtle texture)
- `.sheen` (hover sheen effect)
- `.shadow-gold` (gold glow shadow)

---

## 10) SEO (Metadata, OG image, sitemap, robots)

**File:** `src/app/layout.tsx`
- `metadataBase`, `title`, `description`
- `openGraph`, `twitter`

OG image:
- `public/og.png`

Sitemap:
- `src/app/sitemap.ts` → `/sitemap.xml`

Robots:
- `src/app/robots.ts` → `/robots.txt`

---

## 11) Recipes (Common edits step-by-step)

### Add a new category
1. Add category to `src/data/shop.ts`
2. Add products referencing that category id
3. Add logo SVGs to `public/logos/`

### Add a new lucide icon option
1. Add icon import and mapping in `src/components/icons.tsx`
2. Use the new `iconName` in your category

### Remove the IntroSplash entirely
1. Open `src/app/layout.tsx`
2. Remove `<IntroSplash />`

---

## 12) Performance Checklist (Mobile “no jitter”)

If you see jitter:
1. Confirm backdrop blur is not being used heavily on mobile (it’s already minimized)
2. Lower particle costs (`maxParticles`, `maxDistance`)
3. Keep large images optimized (WebP)
4. Prefer SVG logos over large PNGs
5. Avoid huge box-shadows on big elements

---

## 13) Static Export Limitations (Important gotchas)

Because `output: "export"`:
- No server-side routes or runtime API endpoints
- Next Image optimization is disabled (`images.unoptimized: true`)
- Keep everything static + client-side

---

## 14) Appendix: Component responsibilities

- `layout.tsx` — global wrapper + metadata + splash + nav + footer
- `page.tsx` — one-page section composition
- `Hero.tsx` — headline + large logo on right + CTAs
- `ShopByCategory.tsx` — category list + modal product list
- `IntroSplash.tsx` — 4s loader, progress, text, particles
- `ParticleBackground.tsx` — optimized canvas particle network
- `ContactSection.tsx` — WhatsApp group + contact
- `NavBar.tsx` — sticky header with mobile-friendly layout
- `globals.css` — theme tokens + utilities + animations

---

## Optional: Want a short “non-dev editor cheatsheet”?
If you want, I can also produce a second document that only covers:
- changing store name/contact
- editing categories/products
- swapping logos/QR
(without implementation details).
