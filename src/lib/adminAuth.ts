import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "tsp_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  // In production, set ADMIN_SESSION_SECRET.
  // A default is provided for local demo only.
  return process.env.ADMIN_SESSION_SECRET ?? "techshop-pro-demo-secret-change-me";
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function sign(data: string) {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function createAdminSessionToken() {
  const payload = {
    v: 1,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const data = base64url(JSON.stringify(payload));
  const sig = sign(data);
  return `${data}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined | null) {
  if (!token) return false;
  const [data, sig] = token.split(".");
  if (!data || !sig) return false;
  const expected = sign(data);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;
    const decoded = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    return typeof decoded?.exp === "number" && Date.now() < decoded.exp;
  } catch {
    return false;
  }
}

export function requireAdminOrRedirect() {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    redirect("/admin/login");
  }
}

export function adminCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export function buildAdminCookie(token: string) {
  return {
    name: ADMIN_COOKIE_NAME,
    value: token,
    options: adminCookieOptions(Math.floor(SESSION_TTL_MS / 1000)),
  };
}

export function buildClearAdminCookie() {
  return {
    name: ADMIN_COOKIE_NAME,
    value: "",
    options: adminCookieOptions(0),
  };
}
