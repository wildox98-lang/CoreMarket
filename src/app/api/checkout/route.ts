import { NextResponse } from "next/server";
import { Preference } from "mercadopago";
import { db } from "@/lib/db";
import { getMercadoPagoConfig, getSiteUrl, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { createTiendaNubeDraftOrder, createTiendaNubeOrder, isTiendaNubeConfigured } from "@/lib/tiendanube";
import { buildWhatsappUrl } from "@/lib/constants";
import { validateCoupon } from "@/lib/coupons";

type CheckoutBody = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  paymentMethod?: "mercadopago" | "tiendanube" | "local";
  couponCode?: string;
  items: { productId: string; quantity: number }[];
};

type OrderItemDraft = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
};

/** Proportionally lowers the price of coupon-eligible items so their total drops by discountAmount — used only for the external MercadoPago/TiendaNube payloads, never for our own OrderItem records (which keep the catalog price). */
function applyDiscountToItems(
  orderItems: OrderItemDraft[],
  eligibleProductIds: Set<string>,
  discountAmount: number,
): OrderItemDraft[] {
  const eligibleSubtotal = orderItems
    .filter((i) => eligibleProductIds.has(i.productId))
    .reduce((sum, i) => sum + i.subtotal, 0);
  if (eligibleSubtotal <= 0) return orderItems;

  const ratio = Math.max(0, (eligibleSubtotal - discountAmount) / eligibleSubtotal);
  return orderItems.map((item) => {
    if (!eligibleProductIds.has(item.productId)) return item;
    const price = Math.max(0, Math.round(item.price * ratio));
    return { ...item, price, subtotal: price * item.quantity };
  });
}

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
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    include: { category: { select: { name: true } } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const orderItems: OrderItemDraft[] = [];

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

  let discountAmount = 0;
  let couponCode: string | null = null;
  let eligibleProductIds = new Set<string>();

  if (body.couponCode?.trim()) {
    const couponItems = orderItems.map((item) => {
      const product = productMap.get(item.productId)!;
      return {
        productId: item.productId,
        tiendaNubeProductId: product.tiendaNubeProductId,
        categoryName: product.category.name,
        price: item.price,
        quantity: item.quantity,
      };
    });

    let result;
    try {
      result = await validateCoupon(body.couponCode, couponItems, body.customerEmail);
    } catch (error) {
      console.error("Coupon validation failed at checkout", error);
      return NextResponse.json(
        { error: "No pudimos validar el cupón en este momento. Probá de nuevo." },
        { status: 400 },
      );
    }
    if (!result.valid) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    discountAmount = result.discountAmount;
    couponCode = result.code;
    eligibleProductIds = new Set(result.eligibleProductIds);
  }

  const total = subtotal - discountAmount;
  const discountedItems = couponCode
    ? applyDiscountToItems(orderItems, eligibleProductIds, discountAmount)
    : orderItems;

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
      discount: discountAmount,
      couponCode,
      total,
      items: { create: orderItems },
    },
  });

  if (paymentMethod === "local") {
    const fallbackMessage = `Hola! Quiero coordinar el pago de mi pedido #${order.id.slice(-8)} (retiro y pago en el local).`;

    if (!isTiendaNubeConfigured()) {
      return NextResponse.json({ orderId: order.id, checkoutUrl: buildWhatsappUrl(fallbackMessage) });
    }

    try {
      const tnOrder = await createTiendaNubeOrder(
        {
          customerName: body.customerName,
          customerEmail: body.customerEmail,
          customerPhone: body.customerPhone,
          address: null,
          city: null,
          fulfillment: "pickup",
          id: order.id,
          items: discountedItems.map((item) => ({
            quantity: item.quantity,
            price: item.price,
            product: { tiendaNubeVariantId: productMap.get(item.productId)?.tiendaNubeVariantId ?? null },
          })),
        },
        { paymentStatus: "pending", gateway: "offline", total },
      );

      await db.order.update({
        where: { id: order.id },
        data: { tiendaNubeOrderId: String(tnOrder.id) },
      });

      const message = `Hola! Quiero coordinar el pago de mi pedido #${tnOrder.number} (retiro y pago en el local).`;
      return NextResponse.json({ orderId: order.id, checkoutUrl: buildWhatsappUrl(message) });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("TiendaNube order creation failed (pago en el local)", error);
      await db.order.update({
        where: { id: order.id },
        data: { tiendaNubeSyncError: message.slice(0, 2000) },
      });
      return NextResponse.json({ orderId: order.id, checkoutUrl: buildWhatsappUrl(fallbackMessage) });
    }
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
        discount: discountAmount > 0 ? discountAmount : undefined,
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
        items: discountedItems.map((item) => ({
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
