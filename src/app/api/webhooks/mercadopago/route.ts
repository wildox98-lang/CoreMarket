import { NextResponse } from "next/server";
import { Payment, WebhookSignatureValidator, InvalidWebhookSignatureError } from "mercadopago";
import { db } from "@/lib/db";
import { getMercadoPagoConfig, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { createTiendaNubeOrder, isTiendaNubeConfigured } from "@/lib/tiendanube";
import { sendOwnerOrderNotification, isEmailConfigured } from "@/lib/email";

const STATUS_MAP: Record<string, string> = {
  approved: "paid",
  cancelled: "cancelled",
  rejected: "cancelled",
};

export async function POST(request: Request) {
  if (!isMercadoPagoConfigured()) {
    return NextResponse.json({ error: "Mercado Pago no está configurado." }, { status: 503 });
  }

  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  const topic = url.searchParams.get("type") ?? url.searchParams.get("topic");

  const webhookSecret = process.env.MP_WEBHOOK_SECRET;
  if (webhookSecret) {
    try {
      WebhookSignatureValidator.validate({
        xSignature: request.headers.get("x-signature"),
        xRequestId: request.headers.get("x-request-id"),
        dataId,
        secret: webhookSecret,
      });
    } catch (error) {
      if (error instanceof InvalidWebhookSignatureError) {
        console.warn("Invalid MercadoPago webhook signature", error.reason);
        return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
      }
      throw error;
    }
  }

  if (topic !== "payment" || !dataId) {
    return NextResponse.json({ received: true });
  }

  const payment = await new Payment(getMercadoPagoConfig()).get({ id: dataId });
  const orderId = payment.external_reference;
  const nextStatus = payment.status ? STATUS_MAP[payment.status] : undefined;

  if (orderId && nextStatus) {
    const previous = await db.order.findUnique({ where: { id: orderId } });
    const order = await db.order.update({
      where: { id: orderId },
      data: { status: nextStatus, mpPaymentId: String(payment.id) },
      include: { items: { include: { product: true } } },
    });

    const isFirstTimePaid = nextStatus === "paid" && previous?.status !== "paid";

    if (isFirstTimePaid && !order.tiendaNubeOrderId && isTiendaNubeConfigured()) {
      try {
        const tnOrder = await createTiendaNubeOrder(order);
        await db.order.update({
          where: { id: order.id },
          data: { tiendaNubeOrderId: String(tnOrder.id) },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("No se pudo replicar el pedido en TiendaNube", error);
        await db.order.update({
          where: { id: order.id },
          data: { tiendaNubeSyncError: message.slice(0, 2000) },
        });
      }
    }

    if (isFirstTimePaid && isEmailConfigured()) {
      try {
        await sendOwnerOrderNotification(order);
      } catch (error) {
        console.error("No se pudo enviar el email de aviso de pedido", error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
