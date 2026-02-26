"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { IntroSplash } from "@/components/IntroSplash";

/**
 * Renders the intro splash only on the very first page load (or hard refresh),
 * and never when the app is initially opened on /admin routes.
 *
 * Important: this component stays mounted in RootLayout, so the splash won't
 * re-appear on client-side navigation.
 */
export function IntroSplashOnce() {
  const pathname = usePathname();
  const initialPathRef = useRef<string | null>(null);

  if (initialPathRef.current == null) {
    initialPathRef.current = pathname ?? "/";
  }

  const shouldShow = !initialPathRef.current.startsWith("/admin");
  return shouldShow ? <IntroSplash /> : null;
}
