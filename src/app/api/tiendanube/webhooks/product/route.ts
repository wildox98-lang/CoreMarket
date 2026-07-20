import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTiendaNubeProduct, buildLocalUpdateFromTiendaNube } from "@/lib/tiendanube";

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
    const product = await db.product.findFirst({ where: { tiendaNubeProductId: payload.id } });
    if (product) {
      const tnProduct = await getTiendaNubeProduct(payload.id);
      const data = buildLocalUpdateFromTiendaNube(tnProduct, product.name);
      if (Object.keys(data).length > 0) {
        await db.product.update({ where: { id: product.id }, data });
      }
    }
  }

  return NextResponse.json({ received: true });
}
