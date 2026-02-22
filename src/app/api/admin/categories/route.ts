import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";
import { upsertCategory } from "@/lib/catalogStore";
import type { Category } from "@/types/catalog";

export const runtime = "nodejs";

function assertAdmin() {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
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
  const unauth = assertAdmin();
  if (unauth) return unauth;

  const body = (await req.json().catch(() => null)) as { category?: Category } | null;
  if (!body?.category?.id || !body.category.name) {
    return NextResponse.json({ ok: false, error: "Missing category" }, { status: 400 });
  }

  await upsertCategory(body.category);
  return NextResponse.json({ ok: true });
}
