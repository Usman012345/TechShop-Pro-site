"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ParticleBackground from "@/components/ParticleBackground";

const TARGET_TEXT = "TechShop.Pro";

// The splash should be fully gone after exactly 4 seconds.
const DURATION_MS = 4000;

// Characters should only begin forming the real word in the LAST second.
const REVEAL_MS = 1000;

// Keep a quick fade at the end but still finish within the 4s budget.
const FADE_MS = 250;

export function IntroSplash() {
  // CSS-only fallback should show immediately (even before JS is fully ready),
  // then disappear as soon as the canvas draws its first frame.
  const [bgReady, setBgReady] = useState(false);
  const bgReadyOnceRef = useRef(false);
  const handleBgReady = useCallback(() => {
    if (bgReadyOnceRef.current) return;
    bgReadyOnceRef.current = true;
    setBgReady(true);
  }, []);

  const [hidden, setHidden] = useState(false);
  const [fading, setFading] = useState(false);
  // Render characters as fixed-width cells so the scramble doesn't cause subtle
  // horizontal layout jitter.
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Preserve body styles so we can lock/unlock scroll without causing layout shifts.
  const bodyPrevRef = useRef<{ overflow: string; paddingRight: string } | null>(
    null
  );

  // Guard to avoid repeated state writes during the final fade window.
  const fadingRef = useRef(false);

  const intervalRef = useRef<number | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);
  const endTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Lock scroll while the splash is visible, then restore.
    // NOTE: Returning `null` from a component does not unmount it, so we must
    // explicitly unlock when `hidden` flips to `true`.
    if (typeof document === "undefined") return;

    if (!bodyPrevRef.current) {
      bodyPrevRef.current = {
        overflow: document.body.style.overflow,
        paddingRight: document.body.style.paddingRight,
      };
    }

    const prev = bodyPrevRef.current;
    const lock = !hidden;

    if (lock) {
      // Prevent content shift on desktop when scrollbar disappears.
      const scrollbarW =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;
    } else {
      document.body.style.overflow = prev.overflow;
      document.body.style.paddingRight = prev.paddingRight;
    }

    return () => {
      // On unmount or on state change cleanup, restore to original.
      document.body.style.overflow = prev.overflow;
      document.body.style.paddingRight = prev.paddingRight;
    };
  }, [hidden]);

  useEffect(() => {
    if (hidden) return;

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=<>?/[]{}|~";

    const revealStartMs = Math.max(0, DURATION_MS - REVEAL_MS);
    const fadeStartMs = Math.max(0, DURATION_MS - FADE_MS);
    // Finish the word formation by the time fading begins so the full title is
    // clearly visible before the splash disappears.
    const revealEndMs = fadeStartMs;
    const revealSpanMs = Math.max(1, revealEndMs - revealStartMs);

    const writeText = (s: string) => {
      const n = TARGET_TEXT.length;
      for (let i = 0; i < n; i++) {
        const el = charRefs.current[i];
        if (el) el.textContent = s[i] ?? "";
      }
    };

    const buildScramble = (lockedCount: number) => {
      const maxLocked = Math.max(0, Math.min(TARGET_TEXT.length, lockedCount));
      return TARGET_TEXT.split("")
        .map((ch, i) => {
          if (i < maxLocked) return ch;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
    };

    const startedAt = performance.now();

    // Scramble updates are time-based and intentionally not every frame to
    // keep the main thread free for the canvas animation.
    const tick = () => {
      const elapsed = performance.now() - startedAt;

      if (elapsed < revealStartMs) {
        writeText(buildScramble(0));
      } else {
        const local = Math.min(revealSpanMs, Math.max(0, elapsed - revealStartMs));
        const ratio = local / revealSpanMs;
        const locked = Math.min(TARGET_TEXT.length, Math.ceil(ratio * TARGET_TEXT.length));
        writeText(buildScramble(locked));
      }
    };

    // Start immediately.
    tick();
    intervalRef.current = window.setInterval(tick, 55);

    // Fade + end are strict timers to keep the splash duration consistent.
    fadeTimeoutRef.current = window.setTimeout(() => {
      if (!fadingRef.current) {
        fadingRef.current = true;
        setFading(true);
      }
    }, fadeStartMs);

    endTimeoutRef.current = window.setTimeout(() => {
      // Clean up interval first to avoid late writes after unmount.
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      writeText(TARGET_TEXT);
      setHidden(true);
    }, DURATION_MS);

    return () => {
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (fadeTimeoutRef.current != null) {
        window.clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
      if (endTimeoutRef.current != null) {
        window.clearTimeout(endTimeoutRef.current);
        endTimeoutRef.current = null;
      }
    };
  }, [hidden]);

  if (hidden) return null;

  return (
    <div
      className={
        // IMPORTANT: Do not add `relative` here (Tailwind may override `fixed` depending
        // on utility order). `fixed` already establishes a containing block for the
        // absolutely-positioned canvas.
        "fixed inset-0 z-[9999] grid place-items-center bg-bg transition-opacity duration-[250ms] " +
        (fading ? "opacity-0 pointer-events-none" : "opacity-100")
      }
      aria-label="Loading"
    >
      {/*
        CSS-only animated fallback (renders immediately from static HTML/CSS).
        Hidden as soon as the canvas renders its first frame.
      */}
      {!bgReady && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="splash-fallback-layer" />
        </div>
      )}

      {/* Reusable particle network background (gold theme) */}
      <ParticleBackground
        // Brighter gold for a more premium, luminous loading moment
        particleColor="#FFD700"
        lineColor="#FFD700"
        backgroundInner="#0b0b0b"
        backgroundOuter="#000000"
        // Tuned for: smoother motion + brighter glow without stutter.
        minParticles={52}
        maxParticles={98}
        densityDivisor={15000}
        maxDistance={175}
        // Slightly faster drift so dots feel more alive.
        speed={0.8}
        lineOpacity={0.52}
        lineWidth={1}
        particleOpacity={0.92}
        particleRadiusMin={1.2}
        particleRadiusMax={2.8}
        glow
        // Brighter glow (implemented efficiently via sprites + bucketed lines)
        glowBlur={18}
        // Ensure the canvas reliably stacks behind the text on all browsers.
        style={{ zIndex: 0 }}
        onReady={handleBgReady}
        // Keep the loading moment animated even if the OS prefers reduced motion.
        // (You can switch this back to `true` if you want strict accessibility.)
        respectReducedMotion={false}
      />

      <div className="relative z-10 px-6 text-center">
        <div
          className="font-display text-3xl text-gold2 sm:text-5xl"
          style={{ textShadow: "0 0 18px rgba(255,215,0,0.32)" }}
        >
          <span className="inline-flex items-center justify-center gap-[0.18em]">
            {Array.from({ length: TARGET_TEXT.length }).map((_, i) => (
              <span
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                ref={(el) => {
                  charRefs.current[i] = el;
                }}
                className="inline-block w-[0.95em] text-center"
              >
                .
              </span>
            ))}
          </span>
        </div>

        <div className="mx-auto mt-5 h-2 w-[min(420px,78vw)] overflow-hidden rounded-full border border-gold/25 bg-panel/45">
          <div
            className="h-full origin-left scale-x-0 bg-gradient-to-r from-gold2 to-gold shadow-gold will-change-transform"
            style={{ animation: `splash-progress ${DURATION_MS}ms linear forwards` }}
          />
        </div>

        <div className="mt-4 text-xs uppercase tracking-[0.35em] text-muted">
          Loading storefront modules…
        </div>

        <div className="mt-2 text-[11px] text-muted/80">Please wait…</div>
      </div>
    </div>
  );
}
