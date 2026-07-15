import { NextResponse } from "next/server";
import { exchangeTiendaNubeCode } from "@/lib/tiendanube";

function htmlPage(body: string) {
  return new NextResponse(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Conexión con TiendaNube</title>
    <style>body{font-family:system-ui,sans-serif;max-width:640px;margin:48px auto;padding:0 24px;line-height:1.5}
    code{background:#f1f1f1;padding:2px 6px;border-radius:4px}pre{background:#f1f1f1;padding:16px;border-radius:8px;overflow-x:auto}</style>
    </head><body>${body}</body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");

  if (!code) {
    return htmlPage("<h1>Falta el parámetro <code>code</code></h1><p>Esta URL debe recibirse como redirección desde TiendaNube al instalar la app, no visitarse directamente.</p>");
  }

  try {
    const { access_token, user_id, scope } = await exchangeTiendaNubeCode(code);
    return htmlPage(`
      <h1>¡Conectado con TiendaNube!</h1>
      <p>Copiá estos dos valores en las variables de entorno del proyecto (Vercel &gt; Settings &gt; Environment Variables) y volvé a desplegar:</p>
      <pre>TIENDANUBE_ACCESS_TOKEN=${access_token}
TIENDANUBE_STORE_ID=${user_id}</pre>
      <p>Permisos otorgados: <code>${scope}</code></p>
      <p>El token no expira, así que este es un paso único.</p>
    `);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return htmlPage(`<h1>No se pudo completar la conexión</h1><p>${message}</p><p>El código de autorización vence a los pocos minutos: si expiró, desinstalá y volvé a instalar la app desde TiendaNube para generar uno nuevo.</p>`);
  }
}
