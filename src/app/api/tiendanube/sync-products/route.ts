import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tiendaNubeFetch, isTiendaNubeConfigured } from "@/lib/tiendanube";

export const maxDuration = 60;

type TiendaNubeProduct = {
  id: number;
  variants: { id: number }[];
};

function requireAuthorized(request: Request) {
  const secret = process.env.TIENDANUBE_SYNC_SECRET;
  const header = request.headers.get("authorization");
  return Boolean(secret) && header === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!requireAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!isTiendaNubeConfigured()) {
    return NextResponse.json({ error: "TiendaNube no está configurado" }, { status: 503 });
  }

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 15), 30);

  const pending = await db.product.findMany({
    where: { tiendaNubeProductId: null },
    include: { images: { orderBy: { position: "asc" } } },
    take: limit,
  });

  const results: { slug: string; ok: boolean; error?: string }[] = [];

  for (const product of pending) {
    try {
      const created = (await tiendaNubeFetch("/products", {
        method: "POST",
        body: JSON.stringify({
          name: { es: product.name },
          description: { es: product.description },
          images: product.images.slice(0, 10).map((img) => ({ src: img.url })),
          variants: [
            {
              price: product.price.toFixed(2),
              stock_management: true,
              stock: product.stock,
              sku: product.sku ?? undefined,
            },
          ],
        }),
      })) as TiendaNubeProduct;

      await db.product.update({
        where: { id: product.id },
        data: {
          tiendaNubeProductId: created.id,
          tiendaNubeVariantId: created.variants[0]?.id ?? null,
        },
      });

      results.push({ slug: product.slug, ok: true });
    } catch (error) {
      results.push({
        slug: product.slug,
        ok: false,
        error: error instanceof Error ? error.message : "error desconocido",
      });
    }

    // TiendaNube's rate limit is a 40-request bucket leaking at 2 req/sec.
    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  const remaining = await db.product.count({ where: { tiendaNubeProductId: null } });

  return NextResponse.json({ processed: results.length, remaining, results });
}
