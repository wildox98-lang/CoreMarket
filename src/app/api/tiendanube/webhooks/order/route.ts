import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOwnerOrderNotification, isEmailConfigured } from "@/lib/email";

function isValidSignature(rawBody: string, signature: string | null) {
  const secret = process.env.TIENDANUBE_CLIENT_SECRET;
  if (!secret || !signature) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const signatureBuf = Buffer.from(signature, "utf8");
  return expectedBuf.length === signatureBuf.length && timingSafeEqual(expectedBuf, signatureBuf);
}

const STATUS_MAP: Record<string, string> = {
  "order/paid": "paid",
  "order/cancelled": "cancelled",
};

/**
 * Handles order/paid and order/cancelled for orders that were paid through
 * TiendaNube's own checkout (the "Pagar con tarjeta / MODO / transferencia"
 * option — see createTiendaNubeDraftOrder). Those orders already exist in
 * TiendaNube (created as an unpaid draft at checkout time, same id once
 * paid), so this only updates our local Order status — unlike the Mercado
 * Pago webhook, it never creates anything in TiendaNube.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-linkedstore-hmac-sha256");

  if (!isValidSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as { event: string; id: number };
  const nextStatus = STATUS_MAP[payload.event];
  if (!nextStatus) {
    return NextResponse.json({ received: true });
  }

  const order = await db.order.findFirst({ where: { tiendaNubeOrderId: String(payload.id) } });
  if (!order) {
    return NextResponse.json({ received: true });
  }

  const isFirstTimePaid = nextStatus === "paid" && order.status !== "paid";

  await db.order.update({ where: { id: order.id }, data: { status: nextStatus } });

  if (isFirstTimePaid && isEmailConfigured()) {
    const fullOrder = await db.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });
    if (fullOrder) {
      try {
        await sendOwnerOrderNotification(fullOrder);
      } catch (error) {
        console.error("No se pudo enviar el email de aviso de pedido", error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
