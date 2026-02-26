import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";
import { deleteProduct, patchProduct } from "@/lib/catalogStore";
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await assertAdmin();
  if (unauth) return unauth;

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as { patch?: Partial<Product> } | null;
  if (!body?.patch) {
    return NextResponse.json({ ok: false, error: "Missing patch" }, { status: 400 });
  }

  try {
    const updated = await patchProduct(id, body.patch);
    return NextResponse.json({ ok: true, product: updated });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Update failed" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await assertAdmin();
  if (unauth) return unauth;
  const { id } = await params;
  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
