import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
  // NOTE: don't use requireAdminOrRedirect in API routes.
} from "@/lib/adminAuth";
import { getCatalog, resetCatalogToSeed, setCatalog } from "@/lib/catalogStore";
import type { Catalog } from "@/types/catalog";

export const runtime = "nodejs";

function assertAdmin() {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const unauth = assertAdmin();
  if (unauth) return unauth;
  return NextResponse.json({ ok: true, catalog: await getCatalog() });
}

/**
 * Replace the in-memory catalog.
 * Body: { catalog: Catalog }
 */
export async function PUT(req: Request) {
  const unauth = assertAdmin();
  if (unauth) return unauth;

  const body = (await req.json().catch(() => null)) as { catalog?: Catalog } | null;
  if (!body?.catalog) {
    return NextResponse.json({ ok: false, error: "Missing catalog" }, { status: 400 });
  }

  await setCatalog(body.catalog);
  return NextResponse.json({ ok: true });
}

/**
 * Reset catalog to seed.
 */
export async function POST(req: Request) {
  const unauth = assertAdmin();
  if (unauth) return unauth;

  // If action=reset
  const url = new URL(req.url);
  if (url.searchParams.get("action") === "reset") {
    await resetCatalogToSeed();
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "Unsupported action" }, { status: 400 });
}
