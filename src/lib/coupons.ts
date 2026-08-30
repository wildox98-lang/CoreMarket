import { db } from "@/lib/db";
import { getTiendaNubeCouponByCode, type TiendaNubeCoupon } from "@/lib/tiendanube";

export type CouponCartItem = {
  productId: string;
  tiendaNubeProductId: number | null;
  categoryName: string;
  price: number;
  quantity: number;
};

export type CouponValidationResult =
  | {
      valid: true;
      code: string;
      type: TiendaNubeCoupon["type"];
      discountAmount: number;
      eligibleProductIds: string[];
    }
  | { valid: false; message: string };

/**
 * Validates a coupon code against TiendaNube's coupon definition (merchant
 * creates/manages coupons there — see getTiendaNubeCouponByCode) and the
 * current cart, and computes the discount in pesos. Always re-run this
 * server-side at checkout — never trust a client-supplied discount amount.
 *
 * Usage counts are tracked in our own Order table (not TiendaNube's `used`
 * field): orders placed through this site never go through TiendaNube's
 * native checkout redemption flow, so their counter wouldn't reflect these.
 */
export async function validateCoupon(
  code: string,
  items: CouponCartItem[],
  customerEmail?: string,
): Promise<CouponValidationResult> {
  const coupon = await getTiendaNubeCouponByCode(code);
  if (!coupon) {
    return { valid: false, message: "No encontramos ese cupón." };
  }
  if (!coupon.valid) {
    return { valid: false, message: "Este cupón ya no está activo." };
  }

  const now = new Date();
  if (coupon.start_date && now < new Date(coupon.start_date)) {
    return { valid: false, message: "Este cupón todavía no está vigente." };
  }
  if (coupon.end_date) {
    const end = new Date(coupon.end_date);
    end.setHours(23, 59, 59, 999);
    if (now > end) {
      return { valid: false, message: "Este cupón ya venció." };
    }
  }

  if (coupon.max_uses != null) {
    const usedLocally = await db.order.count({
      where: {
        couponCode: { equals: coupon.code, mode: "insensitive" },
        status: { not: "cancelled" },
      },
    });
    if (usedLocally >= coupon.max_uses) {
      return { valid: false, message: "Este cupón alcanzó el límite de usos." };
    }
  }

  if (coupon.first_consumer_purchase && customerEmail) {
    const priorOrders = await db.order.count({
      where: { customerEmail: { equals: customerEmail, mode: "insensitive" }, status: { not: "cancelled" } },
    });
    if (priorOrders > 0) {
      return { valid: false, message: "Este cupón es solo para tu primera compra." };
    }
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  let eligibleItems = items;
  if (coupon.products && coupon.products.length > 0) {
    const allowedIds = new Set(coupon.products.map((p) => p.id));
    eligibleItems = items.filter(
      (i) => i.tiendaNubeProductId != null && allowedIds.has(i.tiendaNubeProductId),
    );
  } else if (coupon.categories && coupon.categories.length > 0) {
    const allowedNames = new Set(
      coupon.categories.map((c) => (c.name.es ?? c.name.pt ?? "").trim().toLowerCase()),
    );
    eligibleItems = items.filter((i) => allowedNames.has(i.categoryName.trim().toLowerCase()));
  }

  if (eligibleItems.length === 0) {
    return { valid: false, message: "Este cupón no aplica a los productos de tu carrito." };
  }

  if (coupon.min_price != null && subtotal < coupon.min_price) {
    return { valid: false, message: `Este cupón requiere una compra mínima de $${coupon.min_price}.` };
  }

  const eligibleSubtotal = eligibleItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  let discountAmount = 0;
  if (coupon.type === "percentage") {
    const pct = parseFloat(coupon.value ?? "0");
    discountAmount = Math.round(eligibleSubtotal * (pct / 100));
  } else if (coupon.type === "absolute") {
    const abs = parseFloat(coupon.value ?? "0");
    discountAmount = Math.min(Math.round(abs), eligibleSubtotal);
  } else if (coupon.type === "shipping") {
    return {
      valid: false,
      message: "Este cupón es de envío gratis, y el retiro en el local ya no tiene costo.",
    };
  }

  if (discountAmount <= 0) {
    return { valid: false, message: "Este cupón no genera ningún descuento en tu carrito." };
  }

  return {
    valid: true,
    code: coupon.code,
    type: coupon.type,
    discountAmount,
    eligibleProductIds: eligibleItems.map((i) => i.productId),
  };
}
