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

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      items: {
        include: { product: { select: { slug: true, tiendaNubeProductId: true, tiendaNubeVariantId: true } } },
      },
    },
  });

  return NextResponse.json(
    orders.map((o) => ({
      id: o.id,
      status: o.status,
      createdAt: o.createdAt,
      mpPaymentId: o.mpPaymentId,
      tiendaNubeOrderId: o.tiendaNubeOrderId,
      tiendaNubeSyncError: o.tiendaNubeSyncError,
      items: o.items.map((i) => ({
        slug: i.product.slug,
        quantity: i.quantity,
        tiendaNubeProductId: i.product.tiendaNubeProductId,
        tiendaNubeVariantId: i.product.tiendaNubeVariantId,
      })),
    })),
  );
}
