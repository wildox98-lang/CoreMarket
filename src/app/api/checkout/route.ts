import { NextResponse } from "next/server";
import { Preference } from "mercadopago";
import { db } from "@/lib/db";
import { STORE } from "@/lib/constants";
import { getMercadoPagoConfig, getSiteUrl, isMercadoPagoConfigured } from "@/lib/mercadopago";

type CheckoutBody = {
  fulfillment: "delivery" | "pickup";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address?: string;
  city?: string;
  notes?: string;
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
  if (body.fulfillment === "delivery" && !body.address) {
    return NextResponse.json(
      { error: "La dirección es obligatoria para envíos a domicilio." },
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
  const shipping =
    body.fulfillment === "delivery" && subtotal < STORE.freeShippingThreshold
      ? STORE.deliveryFee
      : 0;
  const total = subtotal + shipping;

  const order = await db.order.create({
    data: {
      status: "pending",
      fulfillment: body.fulfillment,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      address: body.fulfillment === "delivery" ? body.address : null,
      city: body.fulfillment === "delivery" ? body.city : null,
      notes: body.notes,
      subtotal,
      shipping,
      total,
      items: { create: orderItems },
    },
  });

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
        ...(shipping > 0 && {
          shipments: { cost: shipping, mode: "not_specified" },
        }),
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
