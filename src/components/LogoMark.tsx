import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={cn("h-9 w-9", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="tsp-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgb(var(--gold2))" />
          <stop offset="1" stopColor="rgb(var(--gold))" />
        </linearGradient>
        <filter id="tsp-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect
        x="4"
        y="4"
        width="40"
        height="40"
        rx="12"
        stroke="url(#tsp-g)"
        strokeWidth="1.5"
        opacity="0.85"
      />
      <path
        d="M15 18h18M24 18v18"
        stroke="url(#tsp-g)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
        filter="url(#tsp-glow)"
      />
      <circle cx="24" cy="18" r="2.2" fill="url(#tsp-g)" opacity="0.95" />
    </svg>
  );
}
