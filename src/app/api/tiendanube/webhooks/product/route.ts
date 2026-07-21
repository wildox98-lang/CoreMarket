import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTiendaNubeProduct, syncLocalProductFromTiendaNube } from "@/lib/tiendanube";

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
    const tnProduct = await getTiendaNubeProduct(payload.id);
    await syncLocalProductFromTiendaNube(tnProduct);
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
