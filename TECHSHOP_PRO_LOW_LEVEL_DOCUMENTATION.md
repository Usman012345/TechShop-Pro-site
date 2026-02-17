# TechShop Pro — Low‑Level Documentation (Developer Editing Guide)

This document explains **exactly where and how to edit anything and everything** in the TechShop Pro storefront project: text, images, products, layout, styling, animations, SEO files, and deployment settings.

It’s written for editing the codebase directly (there is **no CMS**).

---

## 0) What you are editing

This project is a **single‑page storefront** built with:

- **Next.js (App Router)**
- **React + TypeScript**
- **Tailwind CSS**

The site is deployed as a **static export** (`output: "export"`). That means:

- The final build outputs a static folder: **`/out`**
- The deployed site is HTML/CSS/JS + images (no Node server at runtime)
- You **cannot** use server-only features (API routes, Server Actions, runtime DB queries) unless you remove static export

---

## 1) Fast “Where do I change X?” map

### Branding / contact / SEO basics
- **Store name / description / base URL / WhatsApp / email / phone**
  - `src/data/site.ts`

### Home page layout order
- **Which sections appear and in what order**
  - `src/app/page.tsx`

### Header navigation
- **Nav bar buttons + links**
  - `src/components/NavBar.tsx`

### Footer links and contact
- `src/components/Footer.tsx`

### Hero section (headline + main logo + CTA buttons)
- `src/components/Hero.tsx`
- Logo file: `public/techshoppro-logo.webp`

### Logo icon mark (the square + plus shape)
- `src/components/LogoMark.tsx`

### Shop by category data
- **Categories + products + active/inactive products**
  - `src/data/shop.ts`
- **Watermark logos on product cards**
  - `public/logos/*.svg`

### Shop popup (modal) UI
- `src/components/ShopByCategory.tsx`

### Trusted support cards
- `src/components/TrustedSupport.tsx`

### Contact section (WhatsApp + QR)
- `src/components/ContactSection.tsx`

### Initial loading screen
- Loader duration / title text / progress bar
  - `src/components/IntroSplash.tsx`
- Particle network renderer (canvas)
  - `src/components/ParticleBackground.tsx`

### Top scroll progress bar
- `src/components/ScrollProgress.tsx`

### Theme colors, shadows, animations
- `src/styles/globals.css`
- Tailwind theme mapping: `tailwind.config.ts`

### SEO routes
- `src/app/robots.ts`
- `src/app/sitemap.ts`

### Favicon / app icon
- `src/app/icon.png`
- Social preview image: `public/og.png`

### Deploy behavior (static export, trailing slashes, images)
- `next.config.mjs`

---

## 2) Local development commands

From the project root (same folder as `package.json`):

### Install
```bash
npm install
```

### Run dev server
```bash
npm run dev
```
Open: `http://localhost:3000`

### Build static export
```bash
npm run build
```
This produces an `/out` folder.

### Preview the exported site locally
```bash
npm run preview
```
(or `npm run start` which serves `/out`)

---

## 3) Project structure (what each folder is for)

```
public/                     # Static files served from /
  logos/                    # Product watermark logos (SVG recommended)
  products/                 # Optional product thumbnails (currently not required)
  og.png                    # Social preview image (OpenGraph/Twitter)
  whatsapp-group-qr.png     # WhatsApp group QR
  techshoppro-logo.webp     # Brand logo used in Hero
  noise.png                 # Subtle noise overlay texture

src/
  app/                      # Next.js App Router
    layout.tsx              # Global layout, fonts, metadata, global components
    page.tsx                # Home page
    not-found.tsx           # 404 page
    robots.ts               # robots.txt generator
    sitemap.ts              # sitemap.xml generator
    icon.png                # app icon (Next file convention)

  components/               # UI components
  data/                     # “Content database” (store name, products, contact)
  lib/                      # helpers (className merge, formatting)
  styles/                   # global CSS and theme variables
```

---

## 4) Core configuration files

### 4.1 `next.config.mjs` (Static export settings)
File: `next.config.mjs`

Key settings:

- `output: "export"`
  - Forces a full static export (no server runtime)
- `trailingSlash: true`
  - Every route becomes `/route/` instead of `/route`
- `images.unoptimized: true`
  - `next/image` works, but outputs normal `<img>` tags

**If you ever want server features** (API routes, server actions):

- Remove `output: "export"`
- Redeploy on Vercel with normal Next.js SSR

### 4.2 `tailwind.config.ts` (Theme + design tokens)
File: `tailwind.config.ts`

This connects CSS variables (in `globals.css`) to Tailwind color names:

- `bg` → `rgb(var(--bg) / <alpha-value>)`
- `gold`, `gold2` → brand accents

It also defines:

- `shadow-gold` (gold glow shadow)
- `bg-gold-glow` and `bg-hero-sheen` background utilities

If you want a totally different theme, usually you only need to:

1) Change variables in `globals.css`
2) Optionally update Tailwind config for extra effects

### 4.3 `tsconfig.json` (Path aliases)
File: `tsconfig.json`

This alias is important:

```json
"paths": {
  "@/*": ["./src/*"]
}
```

Meaning:

- `@/components/Hero` = `src/components/Hero`

---

## 5) How the app is assembled (render pipeline)

Understanding this makes editing easier.

### 5.1 `src/app/layout.tsx`
This is the “shell” that wraps **every page**.

It:

- Loads fonts
- Applies global CSS (`globals.css`)
- Sets SEO metadata
- Renders always-on UI:
  - `ScrollProgress`
  - `IntroSplash`
  - `NavBar`
  - `Footer`
- Wraps page content in a centered container:
  - `max-w-6xl px-4 py-10`

### 5.2 `src/app/page.tsx`
This is the homepage.

It just composes sections:

- `Hero`
- `ShopByCategory`
- `TrustedSupport`
- `ContactSection`

So if you want to:

- Add a section → edit `page.tsx`
- Remove a section → delete from `page.tsx`

---

## 6) Content editing (store name, contact, WhatsApp)

### 6.1 Edit store name, SEO description, base URL
File: `src/data/site.ts`

- `site.name` → store name shown across the UI
- `site.description` → SEO description + OpenGraph/Twitter metadata
- `site.url` → used for metadata base, sitemap, robots

Recommended deployment pattern:

- Set `NEXT_PUBLIC_SITE_URL` in Vercel environment variables
- Keep `site.url` reading from env (already implemented)

### 6.2 Edit phone, WhatsApp number, email
File: `src/data/site.ts`

```ts
export const CONTACT = {
  phoneDisplay: "0328...",
  phoneE164: "92328...", // no + sign, must be international format
  email: "...",
};
```

**Important difference:**
- `phoneDisplay` = what users see on screen
- `phoneE164` = what WhatsApp uses in the link (`wa.me/<number>`) — must be correct

### 6.3 Change the default WhatsApp message
The project often uses:

```ts
whatsappLink("السلام عليكم")
```

To change the default message:

- Search the codebase for `"السلام عليكم"` and replace it.

Recommended improvement (optional):

- Add a constant like `DEFAULT_WA_MESSAGE` in `src/data/site.ts`
- Use it everywhere so you only change it once

### 6.4 WhatsApp group link + QR
File: `src/data/site.ts`

- `WHATSAPP_GROUP_LINK` → invite link
- `WHATSAPP_GROUP_QR` → path to QR image

Replace the QR image file:

- `public/whatsapp-group-qr.png`

---

## 7) Header navigation (NavBar)

File: `src/components/NavBar.tsx`

### 7.1 Links
The nav is built from anchor links:

- `<a href="#home">`
- `<a href="#categories">`

If you add a new section, add a new link:

```tsx
<a href="#testimonials" className="...">Testimonials</a>
```

### 7.2 Mobile behavior
On mobile:

- The action buttons are inside a horizontally scrollable row
- The container uses:
  - `overflow-x-auto whitespace-nowrap`

If your buttons wrap/overflow weirdly:

- Keep `shrink-0` on buttons
- Keep `overflow-x-auto` on small screens

---

## 8) Footer

File: `src/components/Footer.tsx`

### 8.1 Update section links
Footer links are also anchor links (`#home`, `#contact`, etc).

If you change section IDs or add a new section, update them here too.

### 8.2 Update the copyright
It currently uses:

```tsx
© {new Date().getFullYear()} {site.name}
```

Change the text after that to match your business (e.g. remove “Personal portfolio demo”).

---

## 9) Logo mark (the small square logo)

File: `src/components/LogoMark.tsx`

This is a pure SVG component.

### 9.1 Change its size
It defaults to `h-9 w-9`.

You can pass a class:

```tsx
<LogoMark className="h-12 w-12" />
```

### 9.2 Change its design
Edit the SVG paths and gradients in `LogoMark.tsx`.

This is the safest way to create a custom brand icon without relying on image files.

---

## 10) Hero section (headline + main logo)

File: `src/components/Hero.tsx`

### 10.1 Change the headline text
Edit the `<h1>` content.

The store name comes from:

```tsx
{site.name}
```

You can change the remaining text directly.

### 10.2 Change hero logo image
The hero uses:

- `public/techshoppro-logo.webp`

You can:

- Replace the file (keep the same name), **or**
- Update `src="/techshoppro-logo.webp"` to a different file

### 10.3 Fixing overlap issues on mobile
Mobile overlap happens when:

- A flex row tries to fit text + image side-by-side
- The image has a large `min-width`

Reliable pattern:

- Stack on mobile: `flex-col`
- Switch to row on `sm:`: `sm:flex-row`
- Add `min-w-0` to the text container so it can shrink

---

## 11) Products & categories (the “database”)

File: `src/data/shop.ts`

This file controls everything inside **Shop by Category**.

### 11.1 Categories
A category looks like:

```ts
{
  id: "vpn",
  name: "VPN Services",
  description: "Privacy, secure browsing, and fast servers.",
  iconName: "Globe",
}
```

Low-level details:

- `id` must be in the `CategoryId` union type at the top of the file.
  - If you add a new category id, add it to the union.
- `iconName` must exist in `src/components/icons.tsx`.

### 11.2 Products
A product looks like:

```ts
{
  id: "vpn-nord",
  name: "NordVPN",
  categoryId: "vpn",
  logo: "/logos/nordvpn.svg",
  isActive: true,
}
```

Rules:

- `categoryId` must match an existing category `id`
- `logo` must point to a file inside `public/` (usually `public/logos/...`)
- `isActive: false` hides the product without deleting it

### 11.3 Add a new category (step-by-step)
1) Add the new ID to `CategoryId`:

```ts
export type CategoryId = "vpn" | "security" | "myNewCategory";
```

2) Add a category object inside `categories`.

3) Add products using `categoryId: "myNewCategory"`.

---

## 12) Icons (lucide-react)

File: `src/components/icons.tsx`

It imports icons from `lucide-react` and exposes them as a map:

```ts
export const Icons = { Shield, Globe, ... }
```

### 12.1 Add a new icon
1) Import from `lucide-react`
2) Add it to `Icons`
3) Update the `Category.iconName` union in `src/data/shop.ts` to include the new key

---

## 13) ShopByCategory section + modal popup

File: `src/components/ShopByCategory.tsx`

### 13.1 What it does
- Shows category cards
- Clicking a category opens a full-screen modal
- Modal lists products from `activeProductsByCategory(categoryId)`
- Each product has a “Contact” button that opens WhatsApp with a pre-filled message

### 13.2 Change category card UI
Each category card is rendered here:

```tsx
{categories.map((c) => (
  <button key={c.id}>...</button>
))}
```

Edit that block to change:

- Layout
- Icon size
- Spacing
- Hover effects

### 13.3 Change product card layout
Inside the modal, each product is rendered here:

```tsx
{items.map((p) => (
  <article key={p.id}>...</article>
))}
```

Edit that block to add things like:

- Price
- Features
- Product thumbnails (`public/products/*`)
- Badges (Best Seller, Discount, etc.)

### 13.4 Change the WhatsApp product message
This function controls the message:

```ts
function productMessage(productName: string) {
  return `السلام عليكم\n${productName}`;
}
```

Edit it to include:

- Plan name
- Quantity
- Your greeting

Example:

```ts
return `Hello! I want ${productName}. Please send price and available plans.`;
```

### 13.5 Modal behavior (ESC close, scroll lock)
The modal:

- closes on ESC
- locks body scroll while open
- autofocuses the close button

This is all in the `useEffect` near the top.

If you create more modals later, reuse this pattern.

---

## 14) TrustedSupport section

File: `src/components/TrustedSupport.tsx`

Contains three “cards”:

- WhatsApp
- Call
- Email

Edit the text directly in this component.

If you want to add more support methods (Telegram, Instagram, etc.), copy one card block and adjust.

---

## 15) ContactSection

File: `src/components/ContactSection.tsx`

This section shows:

- Direct contact info (phone + email)
- WhatsApp button
- Call button
- WhatsApp group CTA + QR code

Edit text directly, and edit contact details in `src/data/site.ts`.

---

## 16) Intro loading overlay (IntroSplash)

File: `src/components/IntroSplash.tsx`

### 16.1 What it does
- Shows a full-screen loading overlay for a fixed time
- Plays a background particle animation (`<ParticleBackground />`)
- Displays a scramble title that resolves to `TARGET_TEXT`
- Shows an animated progress bar
- Locks scroll while visible

### 16.2 Change duration
Change:

```ts
const DURATION_MS = 4000;
```

### 16.3 Change the loader title
Change:

```ts
const TARGET_TEXT = "TechShop.Pro";
```

### 16.4 Change scramble/reveal timing
- `REVEAL_MS`: last part of loader where letters lock
- `FADE_MS`: fade-out duration

### 16.5 Fix title not centered on mobile
The loader title is made of fixed-width character cells.

On narrow screens, the total width can become too wide, making it look off-center.

Fix patterns:

- Clamp font size: `text-[clamp(1.35rem,7vw,3rem)]`
- Reduce gap on mobile: `gap-[0.12em] sm:gap-[0.18em]`
- Reduce per-letter width on mobile: `w-[0.85em] sm:w-[0.95em]`

---

## 17) Particle background renderer (canvas)

File: `src/components/ParticleBackground.tsx`

### 17.1 What it does
- Creates particles with random positions & velocities
- Moves them every frame
- Uses a **grid acceleration** to only connect nearby particles
- Draws bucketed line segments (fewer canvas draw calls)
- Draws glowing dots using a pre-rendered sprite (faster than per-dot shadows)

### 17.2 Main props you can tune
Used in `IntroSplash.tsx`:

```tsx
<ParticleBackground
  minParticles={52}
  maxParticles={98}
  densityDivisor={15000}
  maxDistance={175}
  speed={0.8}
  glowBlur={18}
/>
```

Meaning:

- `minParticles` / `maxParticles`: limits particle count
- `densityDivisor`: higher = fewer particles
- `maxDistance`: connection distance
- `speed`: drift speed
- `glow` + `glowBlur`: glow strength

### 17.3 Mobile performance tuning
If phones lag:

- Reduce `maxParticles`
- Reduce `maxDistance`
- Increase `densityDivisor`
- Disable glow: `glow={false}`

---

## 18) Scroll progress bar

File: `src/components/ScrollProgress.tsx`

### 18.1 What it does
- A thin bar at the top that scales from 0 → 1 as you scroll
- Uses `requestAnimationFrame` and direct DOM writes (avoids React rerenders)

### 18.2 Change thickness
In the return JSX:

```tsx
<div className="... h-[3px] ...">
```

Change `h-[3px]` to something else.

### 18.3 Change colors
It uses the same gold gradient classes:

- `from-gold2 to-gold`

Change those classes to use other colors.

### 18.4 Disable it
Remove `<ScrollProgress />` from `src/app/layout.tsx`.

---

## 19) Utility helpers (cn, formatting)

File: `src/lib/utils.ts`

### 19.1 `cn()` (className merge)
Used everywhere to combine Tailwind classes safely:

```ts
cn("a", condition && "b")
```

It is built from `clsx` + `tailwind-merge`.

### 19.2 Price helpers
There are helpers like:

- `formatPriceRs(priceRs)`

They are currently optional (the current UI mostly says “Contact”), but you can use these if you decide to add pricing to products.

---

## 20) Global styling & theme system

### 20.1 Theme variables
File: `src/styles/globals.css`

The entire palette is controlled by CSS variables:

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

Change these values to re-theme the site.

### 20.2 Global utility classes
- `.noise` → noise overlay
- `.sheen` → hover “shine”
- `.no-scrollbar` → hides scrollbars

If you want to remove the noise overlay:

- Remove `noise` class from the wrapper div in `layout.tsx`

### 20.3 Animations
`globals.css` defines:

- `floatSlow`, `floatSlow2` (hero glow blobs)
- `splash-progress` (loader progress)
- `splash-fallback-pan` (CSS fallback background movement)

---

## 21) Layout & metadata (SEO, fonts)

File: `src/app/layout.tsx`

### 21.1 What it controls
- Fonts (Google fonts via `next/font/google`)
- SEO metadata
- Always-on UI components

### 21.2 Change fonts
Currently uses Inter + Cinzel.

To change:

1) Replace the font imports
2) Keep the `variable: "--font-*"` mapping so Tailwind `font-sans` and `font-display` still work

### 21.3 Change SEO metadata
Metadata is created using `site.name` and `site.description`.

Best practice:

- Edit those in `src/data/site.ts`

Replace OpenGraph/Twitter preview:

- Replace `public/og.png`

---

## 22) Favicon / app icon

- Replace `src/app/icon.png` to change the favicon/app icon.

Tip:

- Use a square PNG (e.g. 512×512) so it scales well.

---

## 23) robots.txt and sitemap.xml (static export requirement)

Files:

- `src/app/robots.ts`
- `src/app/sitemap.ts`

### 23.1 How to edit
Both use `site.url` as the base domain.

### 23.2 IMPORTANT for Vercel static export
Because this project uses `output: "export"`, Next requires these metadata routes to be fully static.

To prevent build errors like:

> export const dynamic = "force-static" / export const revalidate not configured on route "/robots.txt" with "output: export"

Add this at the top of **both** files:

```ts
export const dynamic = "force-static";
```

(Or alternatively set `export const revalidate = <seconds>` if you want timed regeneration.)

---

## 24) 404 page

File: `src/app/not-found.tsx`

Edit this page to match your brand voice.

If you add more pages later, this will still handle unknown routes.

---

## 25) Adding new pages (optional)

Even though the site is one-page, you can add static pages.

Example: About page

1) Create file:

`src/app/about/page.tsx`

2) Export a component:

```tsx
export default function AboutPage() {
  return <div>About</div>;
}
```

3) Link to it with:

```tsx
import Link from "next/link";

<Link href="/about">About</Link>
```

**Note:** because `trailingSlash: true`, the final URL will be `/about/`.

---

## 26) Responsiveness checklist (so nothing overlaps)

When you change layout, use this checklist:

### 26.1 Flex layouts
- If a row contains text + image:
  - `min-w-0` on the text container
  - `flex-col sm:flex-row` so mobile stacks
  - avoid large fixed `min-w-*` on images

### 26.2 Text scaling
- Use `text-[clamp(...)]` for large hero titles
- Avoid fixed pixel sizes for headings

### 26.3 Containers
- Main container is `max-w-6xl px-4`
- If content feels cramped on mobile, reduce padding in `layout.tsx`

### 26.4 Test viewports
Always test:

- 320px (very small phone)
- 375px (iPhone)
- 390–430px (large phones)
- 768px (tablet)
- 1024px (small laptop)

---

## 27) Common deployment/build problems (and fixes)

### 27.1 ESLint dependency conflicts
If Vercel fails during install with peer dependency issues, ensure:

- `eslint-config-next` and `next` versions match
- `eslint` version satisfies `eslint-config-next`

### 27.2 robots/sitemap static export error
If Vercel fails at “Collecting page data” with `/robots.txt`:

- Add `export const dynamic = "force-static";` to both `robots.ts` and `sitemap.ts`

### 27.3 Images broken after deploy
Because this is static export:

- Images must exist in `public/` or be remote URLs
- `next/image` optimization is disabled intentionally (`unoptimized: true`)

---

## 28) Recommended safe editing workflow

1) Make a change
2) Run:
   ```bash
   npm run dev
   ```
3) Test mobile responsiveness (browser dev tools)
4) Run production build:
   ```bash
   npm run build
   ```
5) If build passes, commit + push
6) Redeploy on Vercel

---

## 29) If you want documentation for your *exact modified version*

If you’ve added new pages/sections/features, upload your current project zip and I’ll extend this doc to cover your new files too.
