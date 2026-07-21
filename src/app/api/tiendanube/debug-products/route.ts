import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function requireAuthorized(request: Request) {
  const secret = process.env.TIENDANUBE_SYNC_SECRET;
  const header = request.headers.get("authorization");
  return Boolean(secret) && header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!requireAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q");

  const products = await db.product.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
    select: {
      id: true,
      slug: true,
      sku: true,
      name: true,
      price: true,
      stock: true,
      categoryId: true,
      brandId: true,
      tiendaNubeProductId: true,
      tiendaNubeVariantId: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
    take: 100,
  });

  return NextResponse.json({ count: products.length, products });
}
