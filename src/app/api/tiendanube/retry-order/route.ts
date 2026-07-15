import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createTiendaNubeOrder, isTiendaNubeConfigured } from "@/lib/tiendanube";

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

  const { orderId } = (await request.json()) as { orderId?: string };
  if (!orderId) {
    return NextResponse.json({ error: "Falta orderId" }, { status: 400 });
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  try {
    const tnOrder = await createTiendaNubeOrder(order);
    await db.order.update({
      where: { id: order.id },
      data: { tiendaNubeOrderId: String(tnOrder.id), tiendaNubeSyncError: null },
    });
    return NextResponse.json({ ok: true, tiendaNubeOrderId: tnOrder.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db.order.update({
      where: { id: order.id },
      data: { tiendaNubeSyncError: message.slice(0, 2000) },
    });
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
