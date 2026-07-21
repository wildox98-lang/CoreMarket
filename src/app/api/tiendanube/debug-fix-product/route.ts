import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function requireAuthorized(request: Request) {
  const secret = process.env.TIENDANUBE_SYNC_SECRET;
  const header = request.headers.get("authorization");
  return Boolean(secret) && header === `Bearer ${secret}`;
}

/**
 * Narrow, secret-protected admin patch for manual data recovery — sets only
 * the whitelisted TiendaNube-linkage/price/stock fields on a product found by
 * slug. Not part of the regular sync flow.
 */
export async function POST(request: Request) {
  if (!requireAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Falta ?slug=" }, { status: 400 });
  }

  const body = (await request.json()) as {
    tiendaNubeProductId?: number;
    tiendaNubeVariantId?: number;
    price?: number;
    stock?: number;
  };

  const data: Record<string, number> = {};
  if (body.tiendaNubeProductId != null) data.tiendaNubeProductId = body.tiendaNubeProductId;
  if (body.tiendaNubeVariantId != null) data.tiendaNubeVariantId = body.tiendaNubeVariantId;
  if (body.price != null) data.price = body.price;
  if (body.stock != null) data.stock = body.stock;

  const product = await db.product.update({ where: { slug }, data });
  return NextResponse.json({ product });
}
