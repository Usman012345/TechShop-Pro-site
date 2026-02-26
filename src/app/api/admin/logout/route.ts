import { NextResponse } from "next/server";
import { buildClearAdminCookie } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const url = new URL("/", req.url);
  // IMPORTANT: use 303 so the browser follows up with a GET request.
  const res = NextResponse.redirect(url, 303);
  const cookie = buildClearAdminCookie();
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}
