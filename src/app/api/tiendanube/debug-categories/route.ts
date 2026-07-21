import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function requireAuthorized(request: Request) {
  const secret = process.env.TIENDANUBE_SYNC_SECRET;
  const header = request.headers.get("authorization");
  return Boolean(secret) && header === `Bearer ${secret}`;
}

/** Lists categories with product counts, for deciding what's safe to clean up. */
export async function GET(request: Request) {
  if (!requireAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const categories = await db.category.findMany({ orderBy: { position: "asc" } });
  const withCounts = await Promise.all(
    categories.map(async (c) => ({
      ...c,
      totalProducts: await db.product.count({ where: { categoryId: c.id } }),
      activeProducts: await db.product.count({ where: { categoryId: c.id, active: true } }),
    })),
  );

  return NextResponse.json(withCounts);
}

/**
 * Narrow admin actions for one-off category cleanup:
 * - ?action=reassign&fromSlug=X&toSlug=Y moves every product (active or not) from X to Y.
 * - ?action=delete&slug=X deletes category X — Prisma will reject it if any product still points there.
 */
export async function POST(request: Request) {
  if (!requireAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  if (action === "reassign") {
    const fromSlug = url.searchParams.get("fromSlug");
    const toSlug = url.searchParams.get("toSlug");
    if (!fromSlug || !toSlug) {
      return NextResponse.json({ error: "Faltan ?fromSlug= y ?toSlug=" }, { status: 400 });
    }
    const [from, to] = await Promise.all([
      db.category.findUniqueOrThrow({ where: { slug: fromSlug } }),
      db.category.findUniqueOrThrow({ where: { slug: toSlug } }),
    ]);
    const result = await db.product.updateMany({
      where: { categoryId: from.id },
      data: { categoryId: to.id },
    });
    return NextResponse.json({ moved: result.count, fromSlug, toSlug });
  }

  if (action === "delete") {
    const slug = url.searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "Falta ?slug=" }, { status: 400 });
    }
    const deleted = await db.category.delete({ where: { slug } });
    return NextResponse.json({ deleted });
  }

  return NextResponse.json({ error: "Falta ?action=reassign|delete" }, { status: 400 });
}
