import { NextResponse } from "next/server";
import { isTiendaNubeConfigured, tiendaNubeFetch } from "@/lib/tiendanube";

function requireAuthorized(request: Request) {
  const secret = process.env.TIENDANUBE_SYNC_SECRET;
  const header = request.headers.get("authorization");
  return Boolean(secret) && header === `Bearer ${secret}`;
}

/** Read-only check: lists coupons from TiendaNube, to confirm our access token can read them. */
export async function GET(request: Request) {
  if (!requireAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!isTiendaNubeConfigured()) {
    return NextResponse.json({ error: "TiendaNube no está configurado" }, { status: 503 });
  }

  try {
    const coupons = await tiendaNubeFetch("/coupons?per_page=50");
    return NextResponse.json(coupons);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
