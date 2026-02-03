"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Point = { x: number; y: number; vx: number; vy: number };

const TARGET_TEXT = "TechShop.Pro";
const DURATION_MS = 5000;
const FADE_MS = 600;

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function IntroSplash() {
  const [hidden, setHidden] = useState(false);
  const [fading, setFading] = useState(false);
  const [text, setText] = useState("............"); // length matches TARGET_TEXT (12)

  // Preserve body styles so we can lock/unlock scroll without causing layout shifts.
  const bodyPrevRef = useRef<{ overflow: string; paddingRight: string } | null>(
    null
  );

  const fadingRef = useRef(false);
  const finishRef = useRef<null | (() => void)>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  const rafRef = useRef<number>(0);
  const scrambleRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const pointsRef = useRef<Point[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });

  // Only used to gate heavy motion; does NOT affect initial HTML markup.
  const reduced = useMemo(() => prefersReducedMotion(), []);

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

    // Text scramble effect (client-only).
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=<>?/[]{}|~";

    let iterations = 0;

    scrambleRef.current = window.setInterval(() => {
      iterations += 1 / 3;

      setText(() =>
        TARGET_TEXT.split("")
          .map((ch, i) => {
            if (i < iterations) return ch;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iterations >= TARGET_TEXT.length) {
        window.clearInterval(scrambleRef.current);
        setText(TARGET_TEXT);
      }
    }, 30) as unknown as number;

    return () => {
      window.clearInterval(scrambleRef.current);
    };
  }, [hidden]);

  useEffect(() => {
    if (hidden) return;

    const canvas = canvasRef.current;
    const bar = barRef.current;
    if (!canvas || !bar) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const createPoints = (w: number, h: number) => {
      // Keep the effect light on mobile by capping the point count.
      const count = Math.max(22, Math.min(60, Math.floor((w * h) / 24000)));
      const pts: Point[] = [];
      for (let i = 0; i < count; i++) {
        const speed = 0.14 + Math.random() * 0.28;
        const ang = Math.random() * Math.PI * 2;
        pts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
        });
      }
      return pts;
    };

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = window.innerWidth;
      const h = window.innerHeight;

      sizeRef.current = { w, h };

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      // Reset transform so our drawing coords are in CSS pixels.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      pointsRef.current = createPoints(w, h);
    };

    const draw = () => {
      const { w, h } = sizeRef.current;
      const pts = pointsRef.current;

      ctx.clearRect(0, 0, w, h);

      // Background fade (helps the “glow” feel)
      const bg = ctx.createRadialGradient(
        w * 0.5,
        h * 0.35,
        0,
        w * 0.5,
        h * 0.35,
        Math.max(w, h)
      );
      bg.addColorStop(0, "rgba(212,175,55,0.08)");
      bg.addColorStop(0.55, "rgba(6,6,8,0.0)");
      bg.addColorStop(1, "rgba(6,6,8,0.0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const threshold = Math.min(170, Math.max(110, w * 0.15));
      const threshold2 = threshold * threshold;

      ctx.lineCap = "round";

      // Lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i];
          const b = pts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 > threshold2) continue;

          const dist = Math.sqrt(dist2);
          const t = 1 - dist / threshold;
          const alpha = t * 0.35;

          // Soft glow layer
          ctx.strokeStyle = `rgba(212,175,55,${alpha * 0.22})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();

          // Crisp core line
          ctx.strokeStyle = `rgba(212,175,55,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Dots
      for (const p of pts) {
        // Outer glow
        ctx.fillStyle = "rgba(255,214,102,0.14)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5.2, 0, Math.PI * 2);
        ctx.fill();

        // Dot core
        ctx.fillStyle = "rgba(255,214,102,0.90)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const finish = () => {
      if (fadingRef.current) return;
      fadingRef.current = true;

      window.cancelAnimationFrame(rafRef.current);
      window.clearInterval(scrambleRef.current);

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

      if (!reduced) {
        const { w, h } = sizeRef.current;
        const pts = pointsRef.current;

        // Move points (cheap physics)
        for (const pt of pts) {
          pt.x += pt.vx;
          pt.y += pt.vy;

          // Wrap edges (prevents “sticking”)
          if (pt.x < -20) pt.x = w + 20;
          if (pt.x > w + 20) pt.x = -20;
          if (pt.y < -20) pt.y = h + 20;
          if (pt.y > h + 20) pt.y = -20;
        }

        draw();
      }

      if (p >= 1) {
        finish();
        return;
      }

      rafRef.current = window.requestAnimationFrame(step);
    };

    resize();
    window.addEventListener("resize", resize);
    rafRef.current = window.requestAnimationFrame(step);

    return () => {
      finishRef.current = null;
      window.cancelAnimationFrame(rafRef.current);
      window.clearInterval(scrambleRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [hidden, reduced]);

  if (hidden) return null;

  return (
    <div
      onPointerDown={() => finishRef.current?.()}
      className={
        "fixed inset-0 z-[999] grid place-items-center bg-bg transition-opacity duration-[600ms] " +
        (fading ? "opacity-0 pointer-events-none" : "opacity-100")
      }
      aria-label="Loading"
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      {/* Extra golden light layer */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "radial-gradient(900px circle at 50% 30%, rgba(212,175,55,0.18), transparent 60%), radial-gradient(700px circle at 70% 65%, rgba(255,214,102,0.12), transparent 58%)",
        }}
        aria-hidden="true"
      />

      <div className="relative px-6 text-center">
        <div className="font-display text-3xl tracking-[0.18em] text-gold2 drop-shadow-[0_0_18px_rgba(212,175,55,0.30)] sm:text-5xl">
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
