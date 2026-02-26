import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";
import { upsertProduct } from "@/lib/catalogStore";
import type { Product } from "@/types/catalog";

export const runtime = "nodejs";

async function assertAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(req: Request) {
  const unauth = await assertAdmin();
  if (unauth) return unauth;

  const body = (await req.json().catch(() => null)) as { product?: Product } | null;
  if (!body?.product?.id) {
    return NextResponse.json({ ok: false, error: "Missing product" }, { status: 400 });
  }

  await upsertProduct(body.product);
  return NextResponse.json({ ok: true });
}
