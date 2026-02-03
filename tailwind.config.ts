import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        gold: "rgb(var(--gold) / <alpha-value>)",
        gold2: "rgb(var(--gold2) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "ui-serif", "Georgia"]
      },
      boxShadow: {
        gold: "0 0 0 1px rgb(var(--gold) / 0.35), 0 8px 30px rgb(var(--gold) / 0.12)"
      },
      backgroundImage: {
        "gold-glow":
          "radial-gradient(600px circle at var(--x, 50%) var(--y, 0%), rgb(var(--gold) / 0.22), transparent 55%)",
        "hero-sheen":
          "linear-gradient(110deg, transparent 0%, rgb(var(--gold2) / 0.20) 35%, transparent 70%)",
      }
    }
  },
  plugins: []
} satisfies Config;
