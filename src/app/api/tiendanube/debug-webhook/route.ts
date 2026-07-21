import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  findTiendaNubeProductBySku,
  getTiendaNubeProduct,
  buildLocalCreateFromTiendaNube,
  buildLocalUpdateFromTiendaNube,
  isTiendaNubeConfigured,
} from "@/lib/tiendanube";

function requireAuthorized(request: Request) {
  const secret = process.env.TIENDANUBE_SYNC_SECRET;
  const header = request.headers.get("authorization");
  return Boolean(secret) && header === `Bearer ${secret}`;
}

async function findTnProduct(sku: string | null, id: string | null) {
  if (sku) return findTiendaNubeProductBySku(sku);
  if (id) return getTiendaNubeProduct(Number(id));
  return null;
}

/**
 * Diagnostic-only reproduction of the product/created & product/updated
 * webhook logic, callable directly (bypassing the HMAC signature check) so
 * we can see exactly what happens for a given SKU/id without waiting on a
 * real TiendaNube webhook delivery. GET inspects only; POST ?apply=true
 * actually creates/updates the local product, as a manual recovery path.
 */
export async function GET(request: Request) {
  if (!requireAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!isTiendaNubeConfigured()) {
    return NextResponse.json({ error: "TiendaNube no está configurado" }, { status: 503 });
  }

  const url = new URL(request.url);
  const sku = url.searchParams.get("sku");
  const id = url.searchParams.get("id");

  try {
    const tnProduct = await findTnProduct(sku, id);
    if (!tnProduct) {
      return NextResponse.json({ found: false, error: "No existe ese producto/SKU en TiendaNube" });
    }

    const localMatch = await db.product.findFirst({ where: { tiendaNubeProductId: tnProduct.id } });
    const localBySku = tnProduct.variants[0]?.sku
      ? await db.product.findUnique({ where: { sku: tnProduct.variants[0].sku } })
      : null;

    return NextResponse.json({ found: true, tnProduct, localMatch, localBySku });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!requireAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!isTiendaNubeConfigured()) {
    return NextResponse.json({ error: "TiendaNube no está configurado" }, { status: 503 });
  }

  const url = new URL(request.url);
  const sku = url.searchParams.get("sku");
  const id = url.searchParams.get("id");

  try {
    const tnProduct = await findTnProduct(sku, id);
    if (!tnProduct) {
      return NextResponse.json({ found: false, error: "No existe ese producto/SKU en TiendaNube" });
    }

    let product = await db.product.findFirst({ where: { tiendaNubeProductId: tnProduct.id } });

    if (!product) {
      const variantSku = tnProduct.variants[0]?.sku?.trim();
      if (variantSku) {
        const bySku = await db.product.findUnique({ where: { sku: variantSku } });
        if (bySku) {
          product = await db.product.update({
            where: { id: bySku.id },
            data: { tiendaNubeProductId: tnProduct.id, tiendaNubeVariantId: tnProduct.variants[0]?.id ?? null },
          });
        }
      }
    }

    if (product) {
      const data = buildLocalUpdateFromTiendaNube(tnProduct, product.name);
      const updated = await db.product.update({ where: { id: product.id }, data: { ...data, active: true } });
      return NextResponse.json({ action: "updated", product: updated });
    }

    const createData = await buildLocalCreateFromTiendaNube(tnProduct);
    const created = await db.product.create({ data: createData });
    return NextResponse.json({ action: "created", product: created });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined },
      { status: 500 },
    );
  }
}
