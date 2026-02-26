import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { put } from "@vercel/blob";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";

export const runtime = "nodejs";

async function assertAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const unauth = await assertAdmin();
  if (unauth) return unauth;

  // Vercel Blob server upload pattern (App Router route handler):
  // the file is sent as the raw request body.
  // https://vercel.com/docs/storage/vercel-blob
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("filename");
  const folderRaw = searchParams.get("folder") ?? "products";
  const folder = folderRaw.replace(/^\/+|\/+$/g, "");

  if (!filename) {
    return NextResponse.json({ ok: false, error: "Missing filename" }, { status: 400 });
  }

  const body = req.body;
  if (!body) {
    return NextResponse.json({ ok: false, error: "Missing upload body" }, { status: 400 });
  }

  // Server uploads are limited to ~4.5MB on Vercel.
  const MAX_BYTES = Math.floor(4.5 * 1024 * 1024);
  const contentLength = req.headers.get("content-length");
  if (contentLength) {
    const bytes = Number(contentLength);
    if (Number.isFinite(bytes) && bytes > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Image is too large (max ~4.5MB)" },
        { status: 400 }
      );
    }
  }

  // Basic type/extension checks.
  const contentType = req.headers.get("content-type") ?? "";
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (contentType && !allowed.includes(contentType)) {
    return NextResponse.json(
      { ok: false, error: "Only JPEG, PNG, and WEBP images are allowed" },
      { status: 400 }
    );
  }

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const ext = safeName.toLowerCase().split(".").pop() ?? "";
  const allowedExt = ["jpg", "jpeg", "png", "webp"];
  if (!allowedExt.includes(ext)) {
    return NextResponse.json(
      { ok: false, error: "Only .jpg, .jpeg, .png, and .webp files are allowed" },
      { status: 400 }
    );
  }

  try {
    const pathname = `${folder}/${safeName}`;
    const blob = await put(pathname, body, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({ ok: true, blob });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
