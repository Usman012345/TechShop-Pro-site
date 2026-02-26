import { NextResponse } from "next/server";
import { buildAdminCookie, createAdminSessionToken } from "@/lib/adminAuth";
import { ensureAdminSeedUser, verifyAdminAuthKey } from "@/lib/adminUsers";
import { explainMongoError } from "@/lib/mongoErrors";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";

  let authKey = "";
  let next = "/admin";

  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => null)) as
      | { authKey?: string; key?: string; password?: string; next?: string }
      | null;
    authKey = body?.authKey ?? body?.key ?? body?.password ?? "";
    next = body?.next ?? next;
  } else {
    const form = await req.formData();
    authKey = String(form.get("authKey") ?? form.get("key") ?? form.get("password") ?? "");
    next = String(form.get("next") ?? next);
  }

  // Ensure a first admin user exists (seed from env) for brand new deployments.
  try {
    await ensureAdminSeedUser();
  } catch (e) {
    const msg = explainMongoError(e);
    if (!contentType.includes("application/json")) {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("error", "setup");
      url.searchParams.set("reason", msg);
      url.searchParams.set("next", next);
      return NextResponse.redirect(url, 303);
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }

  const ok = await verifyAdminAuthKey(authKey);
  if (!ok) {
    // If this was a traditional form POST, redirect back with an error.
    if (!contentType.includes("application/json")) {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("error", "1");
      url.searchParams.set("next", next);
      // IMPORTANT: use 303 so the browser follows up with a GET request.
      // A 307/308 would re-POST to the login page and break the UX.
      return NextResponse.redirect(url, 303);
    }

    return NextResponse.json({ ok: false, error: "Invalid authorization key" }, { status: 401 });
  }

  const token = createAdminSessionToken();
  const cookie = buildAdminCookie(token);

  // If this was a traditional form POST, redirect.
  if (!contentType.includes("application/json")) {
    // IMPORTANT: use 303 so the browser follows up with a GET request.
    const res = NextResponse.redirect(new URL(next, req.url), 303);
    res.cookies.set(cookie.name, cookie.value, cookie.options);
    return res;
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}
