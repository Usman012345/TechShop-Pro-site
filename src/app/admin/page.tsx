import { requireAdminOrRedirect } from "@/lib/adminAuth";
import { isPersistentStorageEnabled } from "@/lib/catalogStore";
import { AdminClient } from "@/app/admin/ui/AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  requireAdminOrRedirect();
  const persistenceEnabled = await isPersistentStorageEnabled();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.30em] text-gold2/80">Admin Panel</div>
          <h1 className="mt-2 font-display text-2xl md:text-3xl">Catalog Manager</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Manage categories and products for your storefront. For persistence on Vercel, configure
            Vercel KV (or Upstash Redis REST) environment variables.
          </p>
        </div>

        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-full border border-fg/10 bg-panel/45 px-5 text-sm text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
          >
            Logout
          </button>
        </form>
      </div>

      <AdminClient persistenceEnabled={persistenceEnabled} />
    </div>
  );
}
