import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";
import { deleteDraftCategory, patchDraftCategory } from "@/lib/draftCatalogStore";
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await assertAdmin();
  if (unauth) return unauth;

  const { id } = await params;

  const body = (await req.json().catch(() => null)) as { patch?: Partial<Category> } | null;
  if (!body?.patch) {
    return NextResponse.json({ ok: false, error: "Missing patch" }, { status: 400 });
  }

  try {
    const updated = await patchDraftCategory(id, body.patch);
    return NextResponse.json({ ok: true, category: updated });
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Update failed";
    const notFound = raw.toLowerCase().includes("not found");
    return NextResponse.json(
      { ok: false, error: notFound ? raw : explainMongoError(e) },
      { status: notFound ? 404 : 500 }
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
  try {
    await deleteDraftCategory(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: explainMongoError(e) }, { status: 500 });
  }
}
