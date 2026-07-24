import { NextResponse } from "next/server";
import { Preference } from "mercadopago";
import { db } from "@/lib/db";
import { getMercadoPagoConfig, getSiteUrl, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { createTiendaNubeDraftOrder, isTiendaNubeConfigured } from "@/lib/tiendanube";
import { buildWhatsappUrl } from "@/lib/constants";

type CheckoutBody = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  paymentMethod?: "mercadopago" | "tiendanube" | "local";
  items: { productId: string; quantity: number }[];
};

export async function POST(request: Request) {
  let body: CheckoutBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de la solicitud inválido." }, { status: 400 });
  }

  if (!body.items?.length) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }
  if (!body.customerName || !body.customerEmail || !body.customerPhone) {
    return NextResponse.json(
      { error: "Faltan datos de contacto obligatorios." },
      { status: 400 },
    );
  }

  const productIds = body.items.map((i) => i.productId);
  const products = await db.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const orderItems: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[] = [];

  for (const item of body.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Un producto de tu carrito ya no está disponible.` },
        { status: 400 },
      );
    }
    if (item.quantity < 1 || item.quantity > product.stock) {
      return NextResponse.json(
        { error: `No hay stock suficiente de "${product.name}".` },
        { status: 400 },
      );
    }
    orderItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal: product.price * item.quantity,
    });
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.subtotal, 0);
  const total = subtotal;
  const paymentMethod =
    body.paymentMethod === "tiendanube" || body.paymentMethod === "local"
      ? body.paymentMethod
      : "mercadopago";

  const order = await db.order.create({
    data: {
      status: "pending",
      fulfillment: "pickup",
      paymentMethod,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      notes: body.notes,
      subtotal,
      shipping: 0,
      total,
      items: { create: orderItems },
    },
  });

  if (paymentMethod === "local") {
    const message = `Hola! Quiero coordinar el pago de mi pedido #${order.id.slice(-8)} (retiro y pago en el local).`;
    return NextResponse.json({ orderId: order.id, checkoutUrl: buildWhatsappUrl(message) });
  }

  if (paymentMethod === "tiendanube") {
    if (!isTiendaNubeConfigured()) {
      return NextResponse.json({ orderId: order.id, checkoutUrl: null });
    }

    try {
      const draftOrder = await createTiendaNubeDraftOrder({
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        id: order.id,
        items: orderItems.map((item) => ({
          quantity: item.quantity,
          product: { tiendaNubeVariantId: productMap.get(item.productId)?.tiendaNubeVariantId ?? null },
        })),
      });

      await db.order.update({
        where: { id: order.id },
        data: { tiendaNubeOrderId: String(draftOrder.id) },
      });

      return NextResponse.json({ orderId: order.id, checkoutUrl: draftOrder.checkout_url });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("TiendaNube draft order creation failed", error);
      await db.order.update({
        where: { id: order.id },
        data: { tiendaNubeSyncError: message.slice(0, 2000) },
      });
      return NextResponse.json({ orderId: order.id, checkoutUrl: null });
    }
  }

  if (!isMercadoPagoConfigured()) {
    return NextResponse.json({ orderId: order.id, checkoutUrl: null });
  }

  try {
    const preferenceClient = new Preference(getMercadoPagoConfig());
    const siteUrl = getSiteUrl();

    const preference = await preferenceClient.create({
      body: {
        items: orderItems.map((item) => ({
          id: item.productId,
          title: item.name,
          quantity: item.quantity,
          currency_id: "ARS",
          unit_price: item.price,
        })),
        payer: { name: body.customerName, email: body.customerEmail },
        external_reference: order.id,
        back_urls: {
          success: `${siteUrl}/pedido/${order.id}`,
          pending: `${siteUrl}/pedido/${order.id}`,
          failure: `${siteUrl}/pedido/${order.id}`,
        },
        auto_return: "approved",
        notification_url: `${siteUrl}/api/webhooks/mercadopago`,
      },
    });

    await db.order.update({
      where: { id: order.id },
      data: { mpPreferenceId: preference.id },
    });

    return NextResponse.json({ orderId: order.id, checkoutUrl: preference.init_point });
  } catch (error) {
    console.error("MercadoPago preference creation failed", error);
    return NextResponse.json({ orderId: order.id, checkoutUrl: null });
  }
}
