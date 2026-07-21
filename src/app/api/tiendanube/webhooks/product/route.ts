import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getTiendaNubeProduct,
  buildLocalUpdateFromTiendaNube,
  buildLocalCreateFromTiendaNube,
} from "@/lib/tiendanube";

function isValidSignature(rawBody: string, signature: string | null) {
  const secret = process.env.TIENDANUBE_CLIENT_SECRET;
  if (!secret || !signature) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const signatureBuf = Buffer.from(signature, "utf8");
  return expectedBuf.length === signatureBuf.length && timingSafeEqual(expectedBuf, signatureBuf);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-linkedstore-hmac-sha256");

  if (!isValidSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as { event: string; id: number };

  if (payload.event === "product/created" || payload.event === "product/updated") {
    let product = await db.product.findFirst({ where: { tiendaNubeProductId: payload.id } });
    const tnProduct = await getTiendaNubeProduct(payload.id);

    // Not linked by id yet: it may already exist locally under the same SKU
    // (e.g. created here first, then pushed to TiendaNube by someone else).
    if (!product) {
      const sku = tnProduct.variants[0]?.sku?.trim();
      if (sku) {
        const bySku = await db.product.findUnique({ where: { sku } });
        if (bySku) {
          product = await db.product.update({
            where: { id: bySku.id },
            data: { tiendaNubeProductId: tnProduct.id, tiendaNubeVariantId: tnProduct.variants[0]?.id ?? null },
          });
        }
      }
    }

    if (product) {
      const data = buildLocalUpdateFromTiendaNube(tnProduct, product.name);
      const updateData = { ...data, active: true };
      await db.product.update({ where: { id: product.id }, data: updateData });
    } else {
      // Genuinely new: the merchant added this product directly in TiendaNube.
      const createData = await buildLocalCreateFromTiendaNube(tnProduct);
      await db.product.create({ data: createData });
    }
  }

  if (payload.event === "product/deleted") {
    // Products can't be hard-deleted once they have order history, so removing
    // one in TiendaNube soft-deletes it here instead.
    await db.product.updateMany({
      where: { tiendaNubeProductId: payload.id },
      data: { active: false },
    });
  }

  return NextResponse.json({ received: true });
}
