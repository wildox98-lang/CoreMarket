import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  isTiendaNubeConfigured,
  tiendaNubeFetch,
  syncLocalProductFromTiendaNube,
  type TiendaNubeProductDetail,
} from "@/lib/tiendanube";

export const maxDuration = 60;

function requireAuthorized(request: Request) {
  const secret = process.env.TIENDANUBE_SYNC_SECRET;
  const header = request.headers.get("authorization");
  return Boolean(secret) && header === `Bearer ${secret}`;
}

type TiendaNubeProductListItem = { id: number; name: { es?: string; pt?: string } };

/**
 * One-time/occasional reconciliation: catches up on any product added or
 * removed directly in TiendaNube while the create/soft-delete webhook logic
 * didn't exist yet (or wasn't deployed), by diffing TiendaNube's full
 * product list against what we have locally.
 *
 * Paginated with ?page= so a large catalog doesn't risk the function
 * timeout; call repeatedly (bumping ?page=) until `donePaging: true`.
 */
export async function POST(request: Request) {
  if (!requireAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!isTiendaNubeConfigured()) {
    return NextResponse.json({ error: "TiendaNube no está configurado" }, { status: 503 });
  }

  const url = new URL(request.url);
  const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1);
  const perPage = 200;

  const tnProducts = (await tiendaNubeFetch(
    `/products?page=${page}&per_page=${perPage}&fields=id,name`,
  )) as TiendaNubeProductListItem[];

  const localMatches = await db.product.findMany({
    where: { tiendaNubeProductId: { in: tnProducts.map((p) => p.id) } },
    select: { tiendaNubeProductId: true },
  });
  const linkedIds = new Set(localMatches.map((p) => p.tiendaNubeProductId));

  const created: { id: number; name: string }[] = [];
  const errors: { id: number; error: string }[] = [];

  for (const item of tnProducts) {
    if (linkedIds.has(item.id)) continue;
    try {
      const full = (await tiendaNubeFetch(`/products/${item.id}`)) as TiendaNubeProductDetail;
      const result = await syncLocalProductFromTiendaNube(full);
      created.push({ id: item.id, name: result.name });
    } catch (error) {
      errors.push({ id: item.id, error: error instanceof Error ? error.message : String(error) });
    }
    await new Promise((resolve) => setTimeout(resolve, 550));
  }

  return NextResponse.json({
    page,
    fetched: tnProducts.length,
    created,
    errors,
    donePaging: tnProducts.length < perPage,
  });
}

/**
 * Second pass: soft-deletes local products whose TiendaNube product no
 * longer exists in the store's live catalog. Run this *after* every page of
 * the POST reconciliation above has completed, so newly-created links are
 * accounted for.
 */
export async function DELETE(request: Request) {
  if (!requireAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!isTiendaNubeConfigured()) {
    return NextResponse.json({ error: "TiendaNube no está configurado" }, { status: 503 });
  }

  const liveIds = new Set<number>();
  let page = 1;
  while (true) {
    const tnProducts = (await tiendaNubeFetch(
      `/products?page=${page}&per_page=200&fields=id`,
    )) as { id: number }[];
    tnProducts.forEach((p) => liveIds.add(p.id));
    if (tnProducts.length < 200) break;
    page++;
    await new Promise((resolve) => setTimeout(resolve, 550));
  }

  const linked = await db.product.findMany({
    where: { tiendaNubeProductId: { not: null }, active: true },
    select: { id: true, name: true, tiendaNubeProductId: true },
  });

  const toDeactivate = linked.filter((p) => p.tiendaNubeProductId != null && !liveIds.has(p.tiendaNubeProductId));

  if (toDeactivate.length > 0) {
    await db.product.updateMany({
      where: { id: { in: toDeactivate.map((p) => p.id) } },
      data: { active: false },
    });
  }

  return NextResponse.json({
    liveTnProductCount: liveIds.size,
    deactivated: toDeactivate.map((p) => ({ id: p.id, name: p.name, tiendaNubeProductId: p.tiendaNubeProductId })),
  });
}
