"use client";

import React, { useEffect, useMemo, useRef } from "react";

/**
 * ParticleBackground
 * Lightweight canvas-based "particle network / constellation" animation.
 * - Particles drift slowly.
 * - Lines connect only within a threshold distance.
 * - Line opacity fades based on distance.
 * - Responsive resize.
 * - requestAnimationFrame loop with cleanup to prevent leaks.
 */

type RGB = { r: number; g: number; b: number };

export type ParticleBackgroundProps = {
  className?: string;
  style?: React.CSSProperties;

  // Theme
  particleColor?: string; // hex like #D4AF37
  lineColor?: string; // hex like #D4AF37
  backgroundInner?: string; // radial center color
  backgroundOuter?: string; // radial edge color

  // Behavior
  particleCount?: number; // if omitted, auto-calculated from area
  minParticles?: number;
  maxParticles?: number;
  densityDivisor?: number; // larger = fewer particles when auto
  maxDistance?: number; // connection distance (CSS px)
  speed?: number; // overall drift speed multiplier
  particleRadiusMin?: number;
  particleRadiusMax?: number;

  // Visual tuning
  particleOpacity?: number;
  lineOpacity?: number; // max line opacity when very close
  lineWidth?: number;
  glow?: boolean;
  glowBlur?: number;

  // Accessibility
  respectReducedMotion?: boolean;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  seed: number;
};

type PerfHints = {
  quality: number; // 0.55 .. 1
  dprCap: number;
  doHalo: boolean;
  glowBlurScale: number;
  isMobile: boolean;
};

function hexToRgb(hex: string | undefined): RGB {
  if (!hex) return { r: 212, g: 175, b: 55 }; // fallback gold
  let h = hex.replace("#", "").trim();
  // Support #abc
  if (h.length === 3) h = h
    .split("")
    .map((c) => c + c)
    .join("");
  if (h.length !== 6) return { r: 212, g: 175, b: 55 };
  const n = Number.parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getPerfHints(nextWidth: number): PerfHints {
  // Heuristics only. Avoid UA sniffing.
  const isMobile = nextWidth < 640;

  const navAny = typeof navigator !== "undefined" ? (navigator as any) : undefined;
  const mem = typeof navAny?.deviceMemory === "number" ? (navAny.deviceMemory as number) : undefined;
  const cores =
    typeof navAny?.hardwareConcurrency === "number"
      ? (navAny.hardwareConcurrency as number)
      : undefined;

  const lowEnd = (mem != null && mem <= 4) || (cores != null && cores <= 4);

  // Start at full quality and scale down for mobile and low-end devices.
  let quality = 1;
  if (isMobile) quality *= 0.78;
  if (lowEnd) quality *= 0.85;
  quality = clamp(quality, 0.55, 1);

  // Clamping DPR is one of the biggest wins for mobile performance.
  // On mobile we intentionally cap DPR aggressively because blurred / additive
  // canvas effects become fill-rate bound very quickly.
  let dprCap = isMobile ? 1 : 2;
  if (lowEnd) dprCap = Math.min(dprCap, 1.5);

  // Halo layer is beautiful but expensive. Keep on desktop, trim on mobile.
  const doHalo = !isMobile && !lowEnd;

  // Reduce blur cost on mobile.
  // (We don't rely on expensive shadowBlur for the glow anymore, but we still
  // use this as a sizing knob for glow sprites.)
  const glowBlurScale = isMobile ? 0.8 : 1;

  return { quality, dprCap, doHalo, glowBlurScale, isMobile };
}

export default function ParticleBackground({
  className = "",
  style,

  particleColor = "#D4AF37",
  lineColor = "#D4AF37",
  backgroundInner = "#0b0b0b",
  backgroundOuter = "#000000",

  particleCount,
  minParticles = 45,
  maxParticles = 140,
  densityDivisor = 15000,
  maxDistance = 150,
  // Default is intentionally subtle, but IntroSplash can override for a more
  // prominent loading animation.
  speed = 0.45,
  particleRadiusMin = 1.0,
  particleRadiusMax = 2.2,

  particleOpacity = 0.9,
  lineOpacity = 0.35,
  lineWidth = 1,
  glow = true,
  glowBlur = 10,

  respectReducedMotion = true,
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);

  const particleRGB = useMemo(() => hexToRgb(particleColor), [particleColor]);
  const lineRGB = useMemo(() => hexToRgb(lineColor), [lineColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion =
      respectReducedMotion &&
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0; // CSS px
    let height = 0; // CSS px
    let dpr = 1;
    let gradient: CanvasGradient | null = null;
    let particles: Particle[] = [];
    let lastFrameMs = 0;
    let dtSmooth = 1;

    // Performance / quality knobs (adaptive, primarily for mobile smoothness)
    let perf: PerfHints = {
      quality: 1,
      dprCap: 2,
      doHalo: true,
      glowBlurScale: 1,
      isMobile: false,
    };

    // Connection distance (effective, may be scaled down on mobile)
    let maxDist = Math.max(10, maxDistance);
    let maxDistSq = maxDist * maxDist;

    // Grid accel for line drawing
    let cellSize = maxDist;
    let gridCols = 0;
    let gridRows = 0;
    let grid: number[][] = [];

    // Glow sprite for particles (fast on mobile vs per-dot shadowBlur)
    let dotSprite: HTMLCanvasElement | null = null;
    let dotSpriteSize = 0; // CSS px
    let dotSpriteKey = "";

    // Bucketed line rendering (reduces per-line stroke calls drastically)
    const LINE_BUCKETS = 7;
    const lineSegments: number[][] = Array.from({ length: LINE_BUCKETS }, () => []);

    function buildDotSprite() {
      if (typeof document === "undefined") return;

      const blur = Math.max(0, glowBlur * perf.glowBlurScale);
      // Keep the sprite reasonably sized to avoid fill-rate spikes.
      const sizeCss = clamp(blur * 2.4 + 28, 52, 86);
      const key = `${particleRGB.r},${particleRGB.g},${particleRGB.b}|${sizeCss}|${dpr}`;
      if (key === dotSpriteKey && dotSprite) return;
      dotSpriteKey = key;

      dotSpriteSize = sizeCss;
      const sizePx = Math.max(16, Math.round(sizeCss * dpr));

      const c = document.createElement("canvas");
      c.width = sizePx;
      c.height = sizePx;
      const cctx = c.getContext("2d");
      if (!cctx) {
        dotSprite = null;
        return;
      }

      // Draw in CSS px coordinates (consistent with main ctx after setTransform).
      cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const center = sizeCss / 2;
      const radius = sizeCss / 2;

      const g = cctx.createRadialGradient(center, center, 0, center, center, radius);
      g.addColorStop(0, `rgba(${particleRGB.r}, ${particleRGB.g}, ${particleRGB.b}, 1)`);
      g.addColorStop(0.18, `rgba(${particleRGB.r}, ${particleRGB.g}, ${particleRGB.b}, 0.92)`);
      g.addColorStop(0.45, `rgba(${particleRGB.r}, ${particleRGB.g}, ${particleRGB.b}, 0.40)`);
      g.addColorStop(0.75, `rgba(${particleRGB.r}, ${particleRGB.g}, ${particleRGB.b}, 0.12)`);
      g.addColorStop(1, `rgba(${particleRGB.r}, ${particleRGB.g}, ${particleRGB.b}, 0)`);

      cctx.fillStyle = g;
      cctx.beginPath();
      cctx.arc(center, center, radius, 0, Math.PI * 2);
      cctx.fill();

      // Bright core (helps the "golden dot" read clearly even when glow is soft).
      cctx.fillStyle = `rgba(${particleRGB.r}, ${particleRGB.g}, ${particleRGB.b}, 0.95)`;
      cctx.beginPath();
      cctx.arc(center, center, Math.max(1.4, radius * 0.085), 0, Math.PI * 2);
      cctx.fill();

      dotSprite = c;
    }

    function buildGradient() {
      const cx = width * 0.35;
      const cy = height * 0.3;
      const r = Math.max(width, height);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, backgroundInner);
      g.addColorStop(0.6, backgroundOuter);
      g.addColorStop(1, backgroundOuter);
      gradient = g;
    }

    function createParticle(): Particle {
      const radius = rand(particleRadiusMin, particleRadiusMax);
      const angle = rand(0, Math.PI * 2);
      const magnitude = rand(0.35, 1.0) * speed;
      return {
        x: rand(0, width),
        y: rand(0, height),
        vx: Math.cos(angle) * magnitude,
        vy: Math.sin(angle) * magnitude,
        r: radius,
        seed: rand(0, 1000),
      };
    }

    function fitParticleCount(target: number) {
      if (particles.length > target) particles = particles.slice(0, target);
      while (particles.length < target) particles.push(createParticle());
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const nextW = rect.width || window.innerWidth;
      const nextH = rect.height || window.innerHeight;

      width = Math.max(1, nextW);
      height = Math.max(1, nextH);

      // Re-evaluate perf hints whenever the viewport changes.
      perf = getPerfHints(width);

      // Scale down connection distance on mobile to reduce draw work.
      const distScale = perf.isMobile ? 0.82 : 1;
      maxDist = Math.max(10, Math.round(maxDistance * distScale));
      maxDistSq = maxDist * maxDist;

      // Grid based on maxDist.
      cellSize = maxDist;
      gridCols = Math.max(1, Math.ceil(width / cellSize));
      gridRows = Math.max(1, Math.ceil(height / cellSize));
      const total = gridCols * gridRows;
      grid = Array.from({ length: total }, () => []);

      dpr = Math.min(window.devicePixelRatio || 1, perf.dprCap);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      // Draw in CSS px
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildGradient();

      buildDotSprite();

      // Auto-count scales down on mobile / low-end devices.
      const effectiveDensityDivisor = densityDivisor / perf.quality;
      const autoCount = Math.floor((width * height) / effectiveDensityDivisor);

      const effectiveMin = Math.max(10, Math.round(minParticles * perf.quality));
      const effectiveMax = Math.max(effectiveMin, Math.round(maxParticles * perf.quality));
      const requested = particleCount != null ? Math.round(particleCount * perf.quality) : null;

      const target = Math.max(
        effectiveMin,
        Math.min(effectiveMax, requested ?? autoCount)
      );
      fitParticleCount(target);
    }

    function render(now: number) {
      // Background
      ctx.globalAlpha = 1;
      ctx.fillStyle = gradient ?? backgroundOuter;
      ctx.fillRect(0, 0, width, height);

      // Subtle "breathing" for a more ethereal, luxury feel.
      const breatheLines = 0.9 + 0.1 * Math.sin(now * 0.001);
      const breatheDots = 0.92 + 0.08 * Math.sin(now * 0.0013);

      // Frame-normalized delta
      if (!lastFrameMs) {
        lastFrameMs = now;
        dtSmooth = 1;
      }
      const rawDt = (now - lastFrameMs) / 16.6667;
      lastFrameMs = now;
      // Clamp and smooth dt so motion feels continuous even if frame-time jitters.
      const clampedDt = clamp(rawDt, 0, 2.0);
      dtSmooth = dtSmooth * 0.85 + clampedDt * 0.15;
      const dt = dtSmooth;

      // A gentle flow-field style drift so particles don't move in perfectly
      // straight lines (keeps it "techy" but more organic).
      // Increase the motion a bit so it's clearly "alive" even on small
      // screens (the IntroSplash uses this component in a 5s window).
      const t = now * 0.00032;
      const flow = 0.018 * speed;

      const margin = maxDist;
      for (const p of particles) {
        // Smoothly nudge velocity with a small, swirling flow-field.
        // The seed keeps particles from moving in identical patterns.
        const n1 = Math.sin(t + p.y * 0.0105 + p.seed);
        const n2 = Math.cos(t + p.x * 0.0105 + p.seed);

        p.vx += n1 * flow * dt;
        p.vy += n2 * flow * dt;

        // Add a gentle "wander" wobble so motion feels ethereal.
        // (This is a positional drift term, not velocity, so it won't runaway.)
        const wobble = 0.22 * speed;
        p.x += Math.sin(t * 2.2 + p.seed) * wobble * dt;
        p.y += Math.cos(t * 2.0 + p.seed) * wobble * dt;

        // Clamp velocity so we never run away.
        const v = Math.hypot(p.vx, p.vy) || 0.0001;
        const minV = 0.25 * speed;
        const maxV = 1.9 * speed;
        const targetV = clamp(v, minV, maxV);
        p.vx = (p.vx / v) * targetV;
        p.vy = (p.vy / v) * targetV;

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Wrap edges
        if (p.x < -margin) p.x = width + margin;
        else if (p.x > width + margin) p.x = -margin;

        if (p.y < -margin) p.y = height + margin;
        else if (p.y > height + margin) p.y = -margin;
      }

      // Lines (grid-accelerated neighbor search; avoids O(n^2) on denser settings)
      // Clear buckets without reallocating arrays.
      for (let i = 0; i < grid.length; i++) grid[i].length = 0;

      // Populate grid.
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const cx = clamp(Math.floor(p.x / cellSize), 0, gridCols - 1);
        const cy = clamp(Math.floor(p.y / cellSize), 0, gridRows - 1);
        grid[cy * gridCols + cx].push(i);
      }

      // --- Lines (bucketed, glow-friendly, and smoother on mobile) ---
      // Build bucketed segments. Skipping faint / far lines reduces draw calls
      // drastically and avoids stutter.
      for (let bi = 0; bi < LINE_BUCKETS; bi++) lineSegments[bi].length = 0;

      const minT = 0.14; // skip very faint / far lines

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        const cx = clamp(Math.floor(a.x / cellSize), 0, gridCols - 1);
        const cy = clamp(Math.floor(a.y / cellSize), 0, gridRows - 1);

        for (let oy = -1; oy <= 1; oy++) {
          const ny = cy + oy;
          if (ny < 0 || ny >= gridRows) continue;
          for (let ox = -1; ox <= 1; ox++) {
            const nx = cx + ox;
            if (nx < 0 || nx >= gridCols) continue;

            const bucket = grid[ny * gridCols + nx];
            for (let k = 0; k < bucket.length; k++) {
              const j = bucket[k];
              if (j <= i) continue;
              const b = particles[j];
              const dx = a.x - b.x;
              const dy = a.y - b.y;
              const distSq = dx * dx + dy * dy;
              if (distSq > maxDistSq) continue;

              const dist = Math.sqrt(distSq);
              const t = 1 - dist / maxDist; // 1 near, 0 far
              if (t < minT) continue;

              const bi = Math.min(LINE_BUCKETS - 1, Math.floor(t * LINE_BUCKETS));
              lineSegments[bi].push(a.x, a.y, b.x, b.y);
            }
          }
        }
      }

      // Draw the bucketed paths.
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgb(${lineRGB.r}, ${lineRGB.g}, ${lineRGB.b})`;

      // Wider "glow" width driven by glowBlur, but clamped for perf.
      const glowWidth = glow
        ? lineWidth + clamp(glowBlur * 0.12, 1.2, 3.2)
        : lineWidth;

      // Glow pass (wider + softer alpha)
      if (glow) {
        ctx.lineWidth = glowWidth;
        for (let bi = 0; bi < LINE_BUCKETS; bi++) {
          const segs = lineSegments[bi];
          if (!segs.length) continue;
          const tRep = (bi + 0.5) / LINE_BUCKETS;
          const alpha = tRep * lineOpacity * breatheLines;
          ctx.globalAlpha = alpha * 0.58;
          ctx.beginPath();
          for (let s = 0; s < segs.length; s += 4) {
            ctx.moveTo(segs[s], segs[s + 1]);
            ctx.lineTo(segs[s + 2], segs[s + 3]);
          }
          ctx.stroke();
        }
      }

      // Core pass (thin + brighter)
      ctx.lineWidth = lineWidth;
      for (let bi = 0; bi < LINE_BUCKETS; bi++) {
        const segs = lineSegments[bi];
        if (!segs.length) continue;
        const tRep = (bi + 0.5) / LINE_BUCKETS;
        const alpha = tRep * lineOpacity * breatheLines;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        for (let s = 0; s < segs.length; s += 4) {
          ctx.moveTo(segs[s], segs[s + 1]);
          ctx.lineTo(segs[s + 2], segs[s + 3]);
        }
        ctx.stroke();
      }
      ctx.restore();

      // Particles
      // Use a pre-rendered glow sprite for speed + consistent glow brightness.
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = particleOpacity * breatheDots;

      if (glow && dotSprite) {
        const maxR = Math.max(0.0001, particleRadiusMax);
        for (const p of particles) {
          const size = dotSpriteSize * (p.r / maxR);
          ctx.drawImage(dotSprite, p.x - size / 2, p.y - size / 2, size, size);
        }
      }

      // Crisp core dots on top.
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgb(${particleRGB.r}, ${particleRGB.g}, ${particleRGB.b})`;
      ctx.globalAlpha = particleOpacity * breatheDots;
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      rafRef.current = window.requestAnimationFrame(render);
    }
    // Init
    resize();
    window.addEventListener("resize", resize);

    if (prefersReducedMotion) {
      render(performance.now());
      window.cancelAnimationFrame(rafRef.current);
      return () => {
        window.cancelAnimationFrame(rafRef.current);
        window.removeEventListener("resize", resize);
      };
    }

    rafRef.current = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [
    particleRGB,
    lineRGB,
    backgroundInner,
    backgroundOuter,
    particleCount,
    minParticles,
    maxParticles,
    densityDivisor,
    maxDistance,
    speed,
    particleRadiusMin,
    particleRadiusMax,
    particleOpacity,
    lineOpacity,
    lineWidth,
    glow,
    glowBlur,
    respectReducedMotion,
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}
