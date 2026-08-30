import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateCoupon } from "@/lib/coupons";
import { isTiendaNubeConfigured } from "@/lib/tiendanube";

type ValidateBody = {
  code: string;
  items: { productId: string; quantity: number }[];
  customerEmail?: string;
};

export async function POST(request: Request) {
  if (!isTiendaNubeConfigured()) {
    return NextResponse.json({ valid: false, message: "Los cupones no están disponibles en este momento." });
  }

  let body: ValidateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de la solicitud inválido." }, { status: 400 });
  }

  if (!body.code?.trim() || !body.items?.length) {
    return NextResponse.json({ valid: false, message: "Falta el código del cupón." });
  }

  const productIds = body.items.map((i) => i.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds }, active: true },
    include: { category: { select: { name: true } } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const items = body.items
    .map((item) => {
      const product = productMap.get(item.productId);
      if (!product) return null;
      return {
        productId: product.id,
        tiendaNubeProductId: product.tiendaNubeProductId,
        categoryName: product.category.name,
        price: product.price,
        quantity: item.quantity,
      };
    })
    .filter((i): i is NonNullable<typeof i> => i !== null);

  if (items.length === 0) {
    return NextResponse.json({ valid: false, message: "Tu carrito está vacío o desactualizado." });
  }

  try {
    const result = await validateCoupon(body.code, items, body.customerEmail);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Coupon validation failed", error);
    return NextResponse.json({
      valid: false,
      message: "No pudimos validar el cupón en este momento. Probá de nuevo.",
    });
  }
}
