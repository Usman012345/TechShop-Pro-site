import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";
import { upsertDraftCategory } from "@/lib/draftCatalogStore";
import type { Category } from "@/types/catalog";
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

/**
 * Upsert a category.
 * Body: { category: Category }
 */
export async function POST(req: Request) {
  const unauth = await assertAdmin();
  if (unauth) return unauth;

  const body = (await req.json().catch(() => null)) as { category?: Category } | null;
  if (!body?.category?.id || !body.category.name) {
    return NextResponse.json({ ok: false, error: "Missing category" }, { status: 400 });
  }

  try {
    await upsertDraftCategory(body.category);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: explainMongoError(e) }, { status: 500 });
  }
}
