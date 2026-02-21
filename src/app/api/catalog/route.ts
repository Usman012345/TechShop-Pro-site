import { NextResponse } from "next/server";
import { getPublicCatalog } from "@/lib/catalogStore";

export const runtime = "nodejs";

export function GET() {
  const catalog = getPublicCatalog();
  return NextResponse.json(catalog);
}
