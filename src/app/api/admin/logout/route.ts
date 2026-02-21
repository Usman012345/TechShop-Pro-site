import { NextResponse } from "next/server";
import { buildClearAdminCookie } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const url = new URL("/", req.url);
  const res = NextResponse.redirect(url);
  const cookie = buildClearAdminCookie();
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}
