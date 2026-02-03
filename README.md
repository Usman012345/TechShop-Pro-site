# TechShop Pro (Black & Gold One‑Page Demo)

A **Vercel‑ready Next.js (App Router) + TypeScript + Tailwind** one‑page storefront demo in a **black + gold** luxury style.

This version is intentionally **single‑page** (personal project / portfolio) and focuses on a clean, premium first impression:
- Category cards on the home page
- Clicking a category opens a **popup modal** with branded product cards
- Every product card uses a **brand logo watermark** background
- No prices (each card has **Contact** + “Multiple plans available”)

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Edit content

### Products + categories
- `src/data/shop.ts`

### Contact info (WhatsApp / phone / email)
- `src/data/site.ts`

> WhatsApp links open chat to the configured number with **“السلام عليكم”** pre‑filled.

## Intro animation

On first load, the site shows a **5‑second** black & gold intro overlay:
- moving dots + connecting lines
- scrambling characters that resolve to **TechShop.Pro**
- a loading/progress bar

File: `src/components/IntroSplash.tsx`

## Deploy on Vercel (Free / Hobby)

This project uses **static export**:

- Build: `next build`
- Output: `out/`

To test locally:

```bash
npm run build
npm run preview
```

## Notes on logos

Logos included in `public/logos/*.svg` are lightweight placeholders for a portfolio demo.
If you publish commercially, replace them with licensed / approved brand assets.

