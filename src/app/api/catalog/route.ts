import { NextResponse } from "next/server";
import { getPublicCatalog } from "@/lib/catalogStore";

export const runtime = "nodejs";

export async function GET() {
  const catalog = await getPublicCatalog();
  return NextResponse.json(catalog);
}
