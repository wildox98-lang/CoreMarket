import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTiendaNubeProduct, buildLocalUpdateFromTiendaNube, isTiendaNubeConfigured } from "@/lib/tiendanube";

export const maxDuration = 60;

function requireAuthorized(request: Request) {
  const secret = process.env.TIENDANUBE_SYNC_SECRET;
  const header = request.headers.get("authorization");
  return Boolean(secret) && header === `Bearer ${secret}`;
}

/**
 * One-time/occasional backfill: pulls current price+stock from TiendaNube for
 * products that haven't been touched by the product/updated webhook yet.
 * Going forward, the webhook keeps this current in real time.
 */
export async function POST(request: Request) {
  if (!requireAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!isTiendaNubeConfigured()) {
    return NextResponse.json({ error: "TiendaNube no está configurado" }, { status: 503 });
  }

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 15), 30);
  const cursor = url.searchParams.get("cursor");

  const pending = await db.product.findMany({
    where: { tiendaNubeProductId: { not: null }, ...(cursor ? { id: { gt: cursor } } : {}) },
    orderBy: { id: "asc" },
    take: limit,
  });

  const results: { slug: string; ok: boolean; error?: string }[] = [];

  for (const product of pending) {
    try {
      const tnProduct = await getTiendaNubeProduct(product.tiendaNubeProductId!);
      const data = buildLocalUpdateFromTiendaNube(tnProduct, product.name);
      if (Object.keys(data).length > 0) {
        await db.product.update({ where: { id: product.id }, data });
      }
      results.push({ slug: product.slug, ok: true });
    } catch (error) {
      results.push({
        slug: product.slug,
        ok: false,
        error: error instanceof Error ? error.message : "error desconocido",
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  const nextCursor = pending.length === limit ? pending[pending.length - 1].id : null;

  return NextResponse.json({ processed: results.length, nextCursor, results });
}
