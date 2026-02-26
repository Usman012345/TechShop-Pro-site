import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
  // NOTE: don't use requireAdminOrRedirect in API routes.
} from "@/lib/adminAuth";
import { getDraftCatalog, resetDraftToPublished, setDraftCatalog } from "@/lib/draftCatalogStore";
import type { Catalog } from "@/types/catalog";
import { explainMongoError } from "@/lib/mongoErrors";

export const runtime = "nodejs";

async function assertAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const unauth = await assertAdmin();
  if (unauth) return unauth;
  try {
    return NextResponse.json({ ok: true, catalog: await getDraftCatalog() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: explainMongoError(e) }, { status: 500 });
  }
}

/**
 * Replace the in-memory catalog.
 * Body: { catalog: Catalog }
 */
export async function PUT(req: Request) {
  const unauth = await assertAdmin();
  if (unauth) return unauth;

  const body = (await req.json().catch(() => null)) as { catalog?: Catalog } | null;
  if (!body?.catalog) {
    return NextResponse.json({ ok: false, error: "Missing catalog" }, { status: 400 });
  }

  try {
    await setDraftCatalog(body.catalog);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: explainMongoError(e) }, { status: 500 });
  }
}

/**
 * Reset catalog to seed.
 */
export async function POST(req: Request) {
  const unauth = await assertAdmin();
  if (unauth) return unauth;

  // If action=reset
  const url = new URL(req.url);
  if (url.searchParams.get("action") === "reset") {
    try {
      await resetDraftToPublished();
      return NextResponse.json({ ok: true });
    } catch (e) {
      return NextResponse.json({ ok: false, error: explainMongoError(e) }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: false, error: "Unsupported action" }, { status: 400 });
}
