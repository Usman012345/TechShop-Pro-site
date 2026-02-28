import { NextResponse } from "next/server";
import { getPublicCatalog } from "@/lib/catalogStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const catalog = await getPublicCatalog();
  // Ensure the storefront always sees the latest catalog after admin edits.
  return NextResponse.json(catalog, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
