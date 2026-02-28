import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const loggedIn = verifyAdminSessionToken(token);

  const res = NextResponse.json({ ok: true, loggedIn });
  // Prevent any caching so the navbar can reflect login state immediately.
  res.headers.set("Cache-Control", "no-store, max-age=0");
  return res;
}
