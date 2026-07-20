const API_VERSION = "2025-03";
const USER_AGENT = "Core Market (hola@coremarket.com.ar)";

export function isTiendaNubeConfigured() {
  return Boolean(process.env.TIENDANUBE_ACCESS_TOKEN && process.env.TIENDANUBE_STORE_ID);
}

export async function exchangeTiendaNubeCode(code: string) {
  const clientId = process.env.TIENDANUBE_CLIENT_ID;
  const clientSecret = process.env.TIENDANUBE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("TIENDANUBE_CLIENT_ID / TIENDANUBE_CLIENT_SECRET no están configurados");
  }

  const response = await fetch("https://www.tiendanube.com/apps/authorize/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description ?? data.error ?? "No se pudo obtener el access token");
  }

  return data as { access_token: string; token_type: string; scope: string; user_id: number };
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    first_name: parts[0] ?? fullName,
    last_name: parts.slice(1).join(" ") || (parts[0] ?? fullName),
  };
}

export async function createTiendaNubeOrder(order: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string | null;
  city: string | null;
  fulfillment: string;
  id: string;
  items: { quantity: number; product: { tiendaNubeVariantId: number | null } }[];
}) {
  const products = order.items
    .filter((item) => item.product.tiendaNubeVariantId != null)
    .map((item) => ({ variant_id: item.product.tiendaNubeVariantId, quantity: item.quantity }));

  if (products.length === 0) {
    throw new Error("Ninguno de los productos del pedido está sincronizado con TiendaNube");
  }

  const { first_name, last_name } = splitName(order.customerName);
  const address = {
    first_name,
    last_name,
    address: order.address ?? "No informado",
    number: "0",
    city: order.city ?? "No informado",
    province: "No informado",
    zipcode: "0000",
    country: "AR",
    phone: order.customerPhone,
  };

  return tiendaNubeFetch("/orders", {
    method: "POST",
    body: JSON.stringify({
      gateway: "mercadopago",
      payment_status: "paid",
      status: "open",
      inventory_behaviour: "claim",
      products,
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
      },
      note: `Pedido de coremarket.com.ar #${order.id}`,
      billing_address: address,
      shipping_address: address,
      shipping_pickup_type: order.fulfillment === "pickup" ? "pickup" : "ship",
      shipping: "not-provided",
      shipping_cost_customer: 0,
      send_confirmation_email: false,
      send_fulfillment_email: false,
    }),
  }) as Promise<{ id: number }>;
}

type TiendaNubeProductDetail = {
  id: number;
  variants: { id: number; price: string | null; stock: number | null; stock_management: boolean }[];
  images: { id: number; src: string; position: number }[];
};

export async function getTiendaNubeProduct(productId: number) {
  return tiendaNubeFetch(`/products/${productId}`) as Promise<TiendaNubeProductDetail>;
}

/** Extracts { price, stock } (in our own Int-pesos / whole-units shape) from a TiendaNube product's first variant. */
export function readVariantPriceStock(product: TiendaNubeProductDetail) {
  const variant = product.variants[0];
  if (!variant) return null;
  return {
    price: variant.price != null ? Math.round(parseFloat(variant.price)) : null,
    stock: variant.stock_management ? (variant.stock ?? 0) : null,
  };
}

/** Returns TiendaNube's images sorted by position, or null if it has none yet (caller should keep the current photo). */
export function readProductImages(product: TiendaNubeProductDetail) {
  if (product.images.length === 0) return null;
  return [...product.images]
    .sort((a, b) => a.position - b.position)
    .map((img) => img.src);
}

/**
 * Builds a Prisma `Product.update` data object reflecting TiendaNube's
 * current price/stock/images, so it can be applied identically from the
 * one-time backfill and the product/updated webhook. Fields TiendaNube
 * doesn't have an answer for yet (e.g. no images uploaded) are omitted
 * rather than overwritten with something worse.
 */
export function buildLocalUpdateFromTiendaNube(product: TiendaNubeProductDetail, altText: string) {
  const priceStock = readVariantPriceStock(product);
  const images = readProductImages(product);

  return {
    ...(priceStock?.price != null ? { price: priceStock.price } : {}),
    ...(priceStock?.stock != null ? { stock: priceStock.stock } : {}),
    ...(images
      ? {
          images: {
            deleteMany: {},
            create: images.map((url, i) => ({ url, alt: altText, position: i })),
          },
        }
      : {}),
  };
}

/** Returns the existing TiendaNube product for a SKU, or null if none has that SKU yet. */
export async function findTiendaNubeProductBySku(sku: string) {
  const accessToken = process.env.TIENDANUBE_ACCESS_TOKEN;
  const storeId = process.env.TIENDANUBE_STORE_ID;
  if (!accessToken || !storeId) {
    throw new Error("TiendaNube no está configurado (falta TIENDANUBE_ACCESS_TOKEN o TIENDANUBE_STORE_ID)");
  }

  const response = await fetch(
    `https://api.tiendanube.com/${API_VERSION}/${storeId}/products/sku/${encodeURIComponent(sku)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": USER_AGENT },
    },
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`TiendaNube API ${response.status}: ${await response.text()}`);
  }
  return response.json() as Promise<TiendaNubeProductDetail>;
}

export async function tiendaNubeFetch(path: string, init?: RequestInit) {
  const accessToken = process.env.TIENDANUBE_ACCESS_TOKEN;
  const storeId = process.env.TIENDANUBE_STORE_ID;
  if (!accessToken || !storeId) {
    throw new Error("TiendaNube no está configurado (falta TIENDANUBE_ACCESS_TOKEN o TIENDANUBE_STORE_ID)");
  }

  const response = await fetch(`https://api.tiendanube.com/${API_VERSION}/${storeId}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": USER_AGENT,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`TiendaNube API ${response.status}: ${body}`);
  }

  if (response.status === 204) return null;
  return response.json();
}
