import { NextResponse } from "next/server";
import { isTiendaNubeConfigured, tiendaNubeFetch } from "@/lib/tiendanube";

const WEBHOOK_URL = "https://www.coremarket.com.ar/api/tiendanube/webhooks/product";
const REQUIRED_EVENTS = ["product/created", "product/updated", "product/deleted"];

function requireAuthorized(request: Request) {
  const secret = process.env.TIENDANUBE_SYNC_SECRET;
  const header = request.headers.get("authorization");
  return Boolean(secret) && header === `Bearer ${secret}`;
}

type TiendaNubeWebhook = { id: number; event: string; url: string };

/** Registers any of REQUIRED_EVENTS that aren't already pointed at our webhook URL. Safe to call repeatedly. */
export async function POST(request: Request) {
  if (!requireAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!isTiendaNubeConfigured()) {
    return NextResponse.json({ error: "TiendaNube no está configurado" }, { status: 503 });
  }

  const existing = (await tiendaNubeFetch("/webhooks")) as TiendaNubeWebhook[];

  const missing = REQUIRED_EVENTS.filter(
    (event) => !existing.some((w) => w.event === event && w.url === WEBHOOK_URL),
  );

  const created: TiendaNubeWebhook[] = [];
  for (const event of missing) {
    const webhook = (await tiendaNubeFetch("/webhooks", {
      method: "POST",
      body: JSON.stringify({ event, url: WEBHOOK_URL }),
    })) as TiendaNubeWebhook;
    created.push(webhook);
  }

  return NextResponse.json({ created, alreadyRegistered: REQUIRED_EVENTS.filter((e) => !missing.includes(e)) });
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
