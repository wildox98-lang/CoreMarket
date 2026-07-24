import { NextResponse } from "next/server";
import { isTiendaNubeConfigured, tiendaNubeFetch } from "@/lib/tiendanube";

const BASE_URL = "https://www.coremarket.com.ar/api/tiendanube/webhooks";
const REQUIRED: { event: string; url: string }[] = [
  { event: "product/created", url: `${BASE_URL}/product` },
  { event: "product/updated", url: `${BASE_URL}/product` },
  { event: "product/deleted", url: `${BASE_URL}/product` },
  { event: "order/paid", url: `${BASE_URL}/order` },
  { event: "order/cancelled", url: `${BASE_URL}/order` },
];

function requireAuthorized(request: Request) {
  const secret = process.env.TIENDANUBE_SYNC_SECRET;
  const header = request.headers.get("authorization");
  return Boolean(secret) && header === `Bearer ${secret}`;
}

type TiendaNubeWebhook = { id: number; event: string; url: string };

/** Registers any of REQUIRED that aren't already pointed at their webhook URL. Safe to call repeatedly. */
export async function POST(request: Request) {
  if (!requireAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!isTiendaNubeConfigured()) {
    return NextResponse.json({ error: "TiendaNube no está configurado" }, { status: 503 });
  }

  const existing = (await tiendaNubeFetch("/webhooks")) as TiendaNubeWebhook[];

  const missing = REQUIRED.filter(
    (req) => !existing.some((w) => w.event === req.event && w.url === req.url),
  );

  const created: TiendaNubeWebhook[] = [];
  for (const req of missing) {
    const webhook = (await tiendaNubeFetch("/webhooks", {
      method: "POST",
      body: JSON.stringify(req),
    })) as TiendaNubeWebhook;
    created.push(webhook);
  }

  return NextResponse.json({
    created,
    alreadyRegistered: REQUIRED.filter((r) => !missing.includes(r)).map((r) => r.event),
  });
}

export async function GET(request: Request) {
  if (!requireAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!isTiendaNubeConfigured()) {
    return NextResponse.json({ error: "TiendaNube no está configurado" }, { status: 503 });
  }

  const existing = (await tiendaNubeFetch("/webhooks")) as TiendaNubeWebhook[];
  return NextResponse.json(existing);
}
