import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";
import { deleteProduct, patchProduct } from "@/lib/catalogStore";
import type { Product } from "@/types/catalog";

export const runtime = "nodejs";

function assertAdmin() {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const unauth = assertAdmin();
  if (unauth) return unauth;

  const { id } = params;
  const body = (await req.json().catch(() => null)) as { patch?: Partial<Product> } | null;
  if (!body?.patch) {
    return NextResponse.json({ ok: false, error: "Missing patch" }, { status: 400 });
  }

  try {
    const updated = patchProduct(id, body.patch);
    return NextResponse.json({ ok: true, product: updated });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Update failed" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const unauth = assertAdmin();
  if (unauth) return unauth;
  const { id } = params;
  deleteProduct(id);
  return NextResponse.json({ ok: true });
}
