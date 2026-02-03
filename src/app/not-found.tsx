import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-3xl border border-fg/10 bg-panel/45 p-10 text-center">
      <div className="text-xs uppercase tracking-[0.30em] text-gold2/80">404</div>
      <h1 className="mt-4 font-display text-3xl">Page not found</h1>
      <p className="mt-3 text-sm text-muted">
        The page you’re looking for doesn’t exist.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-xl border border-fg/15 bg-bg/25 px-5 py-3 text-sm text-fg/90 transition hover:border-fg/25 hover:bg-bg/45"
        >
          Go home
        </Link>
        <Link
          href="/#categories"
          className="rounded-xl border border-gold/30 bg-bg/35 px-5 py-3 text-sm text-gold2 shadow-gold transition hover:border-gold/55 hover:bg-bg/55"
        >
          Browse categories
        </Link>
      </div>
    </div>
  );
}
