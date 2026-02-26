export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminLoginPage({
  searchParams,
}: {
  // Next.js 15+ makes searchParams async.
  searchParams?: Promise<{ next?: string; error?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const next = sp?.next ?? "/admin";
  const showError = sp?.error === "1";

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="rounded-3xl border border-fg/10 bg-panel/45 p-6 md:p-8">
        <div className="text-xs uppercase tracking-[0.30em] text-gold2/80">Admin</div>
        <h1 className="mt-3 font-display text-2xl md:text-3xl">TechShop Pro Admin</h1>
        <p className="mt-2 text-sm text-muted">
          Password-protected admin panel for managing categories and products (contact-only website).
        </p>

        {showError ? (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            Invalid password. Please try again.
          </div>
        ) : null}

        <form
          className="mt-6 grid gap-3"
          method="post"
          action="/api/admin/login"
        >
          <input type="hidden" name="next" value={next} />
          <label className="grid gap-2">
            <span className="text-xs text-muted">Admin password</span>
            <input
              name="password"
              type="password"
              required
              placeholder="Enter password"
              className="h-11 rounded-xl border border-fg/10 bg-bg/35 px-4 text-sm text-fg placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
            />
          </label>

          <button
            type="submit"
            className="mt-1 inline-flex h-11 items-center justify-center rounded-full border border-gold/30 bg-gold/15 px-5 text-sm text-gold2 shadow-gold transition hover:border-gold/50 hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80"
          >
            Sign in
          </button>

          <p className="mt-2 text-xs text-muted">
            Local dev tip: default password is <span className="text-gold2">techshoppro</span>.
            Change it by setting <span className="text-gold2">ADMIN_PASSWORD</span>.
          </p>
        </form>
      </div>
    </div>
  );
}
