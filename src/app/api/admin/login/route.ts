import { NextResponse } from "next/server";
import { buildAdminCookie, createAdminSessionToken } from "@/lib/adminAuth";

export const runtime = "nodejs";

function getAdminPassword() {
  // Set ADMIN_PASSWORD in Vercel → Project → Settings → Environment Variables.
  // A local dev fallback is provided so the project runs out of the box.
  return process.env.ADMIN_PASSWORD ?? "techshoppro";
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";

  let password = "";
  let next = "/admin";

  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => null)) as
      | { password?: string; next?: string }
      | null;
    password = body?.password ?? "";
    next = body?.next ?? next;
  } else {
    const form = await req.formData();
    password = String(form.get("password") ?? "");
    next = String(form.get("next") ?? next);
  }

  if (!password || password !== getAdminPassword()) {
    // If this was a traditional form POST, redirect back with an error.
    if (!contentType.includes("application/json")) {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("error", "1");
      url.searchParams.set("next", next);
      // IMPORTANT: use 303 so the browser follows up with a GET request.
      // A 307/308 would re-POST to the login page and break the UX.
      return NextResponse.redirect(url, 303);
    }

    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
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
