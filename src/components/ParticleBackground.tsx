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
  speed = 0.35,
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

    const maxDist = Math.max(10, maxDistance);
    const maxDistSq = maxDist * maxDist;

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

      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      // Draw in CSS px
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildGradient();

      const autoCount = Math.floor((width * height) / densityDivisor);
      const target = Math.max(
        minParticles,
        Math.min(maxParticles, particleCount ?? autoCount)
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
      if (!lastFrameMs) lastFrameMs = now;
      const dt = Math.min(2, (now - lastFrameMs) / 16.6667);
      lastFrameMs = now;

      // A gentle flow-field style drift so particles don't move in perfectly
      // straight lines (keeps it "techy" but more organic).
      const t = now * 0.00025;
      const flow = 0.0025 * speed;

      const margin = maxDist;
      for (const p of particles) {
        // Smoothly nudge velocity with a tiny flow field.
        p.vx += Math.sin(t + p.y * 0.01) * flow * dt;
        p.vy += Math.cos(t + p.x * 0.01) * flow * dt;

        // Clamp velocity so we never run away.
        const v = Math.hypot(p.vx, p.vy);
        const maxV = 1.35 * speed;
        if (v > maxV) {
          p.vx = (p.vx / v) * maxV;
          p.vy = (p.vy / v) * maxV;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Wrap edges
        if (p.x < -margin) p.x = width + margin;
        else if (p.x > width + margin) p.x = -margin;

        if (p.y < -margin) p.y = height + margin;
        else if (p.y > height + margin) p.y = -margin;
      }

      // Lines
      ctx.save();
      if (glow) {
        ctx.shadowColor = `rgba(${lineRGB.r}, ${lineRGB.g}, ${lineRGB.b}, 0.32)`;
        ctx.shadowBlur = Math.min(18, glowBlur * 0.6);
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = `rgb(${lineRGB.r}, ${lineRGB.g}, ${lineRGB.b})`;

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > maxDistSq) continue;

          const dist = Math.sqrt(distSq);
          const t = 1 - dist / maxDist; // 1 near, 0 far
          ctx.globalAlpha = t * lineOpacity * breatheLines;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Particles
      ctx.save();
      ctx.fillStyle = `rgb(${particleRGB.r}, ${particleRGB.g}, ${particleRGB.b})`;
      ctx.globalAlpha = particleOpacity * breatheDots;

      if (glow) {
        ctx.shadowColor = `rgba(${particleRGB.r}, ${particleRGB.g}, ${particleRGB.b}, 0.55)`;
        ctx.shadowBlur = glowBlur;
      } else {
        ctx.shadowBlur = 0;
      }

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
