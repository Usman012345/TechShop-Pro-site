import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "@/styles/globals.css";
import { site } from "@/data/site";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { IntroSplash } from "@/components/IntroSplash";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontDisplay = Cinzel({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
  metadataBase: new URL(site.url),
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.name,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: ["/og.png"],
  },
};

// Mobile viewport polish (safe-area support on iOS)
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
} as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontDisplay.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans" suppressHydrationWarning>
        <div className="min-h-svh overflow-x-hidden bg-bg text-fg noise">
          <ScrollProgress />
          <IntroSplash />
          <NavBar />

          <main className="mx-auto w-full max-w-6xl px-4 py-10">{children}</main>

          <Footer />
        </div>
      </body>
    </html>
  );
}
