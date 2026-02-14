"use client";

import { useEffect, useRef, useState } from "react";
import ParticleBackground from "@/components/ParticleBackground";

const TARGET_TEXT = "TechShop.Pro";

// The splash should be fully gone after exactly 5 seconds.
const DURATION_MS = 5000;

// Characters should only begin forming the real word in the LAST second.
const REVEAL_MS = 1000;

// Keep a quick fade at the end but still finish within the 5s budget.
const FADE_MS = 250;

export function IntroSplash() {
  const [hidden, setHidden] = useState(false);
  const [fading, setFading] = useState(false);
  // Keep the same character count as TARGET_TEXT (12) to prevent layout shifts.
  const [text, setText] = useState("............");

  // Preserve body styles so we can lock/unlock scroll without causing layout shifts.
  const bodyPrevRef = useRef<{ overflow: string; paddingRight: string } | null>(
    null
  );

  const fadingRef = useRef(false);
  const finishRef = useRef<null | (() => void)>(null);

  const barRef = useRef<HTMLDivElement | null>(null);

  const rafRef = useRef<number>(0);
  const lastTextTickRef = useRef<number>(0);
  const startRef = useRef<number>(0);

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

    const bar = barRef.current;
    if (!bar) return;

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=<>?/[]{}|~";

    const revealStartMs = Math.max(0, DURATION_MS - REVEAL_MS);
    const fadeStartMs = Math.max(0, DURATION_MS - FADE_MS);
    // Finish the word formation by the time fading begins so the full title is
    // clearly visible before the splash disappears.
    const revealEndMs = fadeStartMs;
    const revealSpanMs = Math.max(1, revealEndMs - revealStartMs);

    const buildScramble = (lockedCount: number) => {
      const maxLocked = Math.max(0, Math.min(TARGET_TEXT.length, lockedCount));
      return TARGET_TEXT.split("")
        .map((ch, i) => {
          if (i < maxLocked) return ch;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
    };

    const finish = () => {
      if (fadingRef.current) return;
      fadingRef.current = true;

      window.cancelAnimationFrame(rafRef.current);

      // Snap to final state and fade out quickly.
      setText(TARGET_TEXT);
      setFading(true);

      window.setTimeout(() => setHidden(true), FADE_MS);
    };

    finishRef.current = finish;

    const step = (t: number) => {
      if (!startRef.current) startRef.current = t;
      const elapsed = t - startRef.current;
      const p = Math.max(0, Math.min(1, elapsed / DURATION_MS));

      // Progress bar: DOM write (no React re-render)
      bar.style.transform = `scaleX(${p})`;

      // Text:
      // - First 4 seconds: fully scrambled.
      // - Last 1 second: letters lock into place.
      // Throttle updates to avoid re-rendering every single frame.
      if (!fadingRef.current && t - lastTextTickRef.current > 45) {
        lastTextTickRef.current = t;

        if (elapsed < revealStartMs) {
          setText(buildScramble(0));
        } else {
          const local = Math.min(revealSpanMs, Math.max(0, elapsed - revealStartMs));
          const ratio = local / revealSpanMs;
          // Use ceil so we reliably reach the final text *before* fade completes.
          const locked = Math.min(
            TARGET_TEXT.length,
            Math.ceil(ratio * TARGET_TEXT.length)
          );
          setText(buildScramble(locked));
        }
      }

      // Begin the fade near the end, but ensure the splash is fully gone by 5s.
      if (!fadingRef.current && elapsed >= fadeStartMs) {
        setFading(true);
      }

      // End exactly at DURATION_MS.
      if (elapsed >= DURATION_MS) {
        window.cancelAnimationFrame(rafRef.current);
        setText(TARGET_TEXT);
        setHidden(true);
        return;
      }

      rafRef.current = window.requestAnimationFrame(step);
    };

    rafRef.current = window.requestAnimationFrame(step);

    return () => {
      finishRef.current = null;
      window.cancelAnimationFrame(rafRef.current);
    };
  }, [hidden]);

  if (hidden) return null;

  return (
    <div
      onPointerDown={() => finishRef.current?.()}
      className={
        "fixed inset-0 z-[999] grid place-items-center bg-bg transition-opacity duration-[250ms] " +
        (fading ? "opacity-0 pointer-events-none" : "opacity-100")
      }
      aria-label="Loading"
    >
      {/* Reusable particle network background (gold theme) */}
      <ParticleBackground
        particleColor="#D4AF37"
        lineColor="#D4AF37"
        backgroundInner="#0b0b0b"
        backgroundOuter="#000000"
        // More prominent + ethereal (denser network, brighter glow)
        minParticles={65}
        maxParticles={125}
        densityDivisor={11000}
        maxDistance={220}
        speed={0.32}
        lineOpacity={0.55}
        lineWidth={1.1}
        particleOpacity={0.95}
        particleRadiusMin={1.2}
        particleRadiusMax={3.0}
        glow
        glowBlur={22}
      />

      <div className="relative px-6 text-center">
        <div className="font-display text-3xl tracking-[0.18em] text-gold2 drop-shadow-[0_0_18px_rgba(255,215,0,0.32)] sm:text-5xl">
          {text}
        </div>

        <div className="mx-auto mt-5 h-2 w-[min(420px,78vw)] overflow-hidden rounded-full border border-gold/25 bg-panel/45">
          <div
            ref={barRef}
            className="h-full origin-left scale-x-0 bg-gradient-to-r from-gold2 to-gold shadow-gold"
          />
        </div>

        <div className="mt-4 text-xs uppercase tracking-[0.35em] text-muted">
          Loading storefront modules…
        </div>

        <div className="mt-2 text-[11px] text-muted/80">Tap to skip</div>
      </div>
    </div>
  );
}
