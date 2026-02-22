import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";
import { deleteCategory, patchCategory } from "@/lib/catalogStore";
import type { Category } from "@/types/catalog";

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

  const body = (await req.json().catch(() => null)) as { patch?: Partial<Category> } | null;
  if (!body?.patch) {
    return NextResponse.json({ ok: false, error: "Missing patch" }, { status: 400 });
  }

  try {
    const updated = await patchCategory(params.id, body.patch);
    return NextResponse.json({ ok: true, category: updated });
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

  await deleteCategory(params.id);
  return NextResponse.json({ ok: true });
}
