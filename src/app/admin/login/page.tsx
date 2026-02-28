import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function safeNextPath(next: string | undefined | null) {
  // Prevent open redirects.
  if (!next) return "/admin";
  if (!next.startsWith("/")) return "/admin";
  if (next.startsWith("//")) return "/admin";
  return next;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  // Next.js 15+ makes searchParams async.
  searchParams?: Promise<{ next?: string; error?: string; reason?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const next = safeNextPath(sp?.next ?? "/admin");
  const error = sp?.error;
  const reason = sp?.reason;

  // Already signed in? Skip the login form.
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (verifyAdminSessionToken(token)) {
    redirect(next);
  }

  const errorMessage =
    error === "1"
      ? "Invalid authorization key. Please try again."
      : error
        ? reason || "Admin setup/login failed. Check MongoDB + ADMIN_AUTH_KEY env vars."
        : null;

  return (
    <div className="mx-auto w-full max-w-lg" suppressHydrationWarning>
      <div className="rounded-3xl border border-fg/10 bg-panel/45 p-6 md:p-8">
        <div className="text-xs uppercase tracking-[0.30em] text-gold2/80">Admin</div>
        <h1 className="mt-3 font-display text-2xl md:text-3xl">TechShop Pro Admin</h1>
        <p className="mt-2 text-sm text-muted">
          Enter your admin authorization key to manage categories and products. The key is stored in
          MongoDB as a bcrypt hash.
        </p>

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            {errorMessage}
          </div>
        ) : null}

        <form
          className="mt-6 grid gap-3"
          method="post"
          action="/api/admin/login"
          suppressHydrationWarning
        >
          <input type="hidden" name="next" value={next} />
          <label className="grid gap-2">
            <span className="text-xs text-muted">Your Admin Authorization Key</span>
            <input
              name="authKey"
              type="password"
              required
              placeholder="Enter authorization key"
              autoCapitalize="none"
              autoCorrect="off"
              suppressHydrationWarning
              className="h-11 rounded-xl border border-fg/10 bg-bg/35 px-4 text-sm text-fg placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
            />
          </label>

          <button
            type="submit"
            className="mt-1 inline-flex h-11 items-center justify-center rounded-full border border-gold/30 bg-gold/15 px-5 text-sm text-gold2 shadow-gold transition hover:border-gold/50 hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
