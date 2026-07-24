import { db } from "@/lib/db";

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

export async function createTiendaNubeOrder(
  order: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string | null;
    city: string | null;
    fulfillment: string;
    id: string;
    items: { quantity: number; product: { tiendaNubeVariantId: number | null } }[];
  },
  options?: { paymentStatus?: "paid" | "pending"; gateway?: string },
) {
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
      gateway: options?.gateway ?? "mercadopago",
      payment_status: options?.paymentStatus ?? "paid",
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
  }) as Promise<{ id: number; number: number }>;
}

/**
 * Creates a Draft Order in TiendaNube with payment_status "unpaid" and
 * returns its checkout_url — a TiendaNube-hosted checkout page where the
 * customer can pay with whatever the store has configured there (Pago
 * Nube: cards, MODO, transfer). Once the customer completes payment there,
 * TiendaNube converts the draft into a real Order (same id) and fires
 * order/paid, which src/app/api/tiendanube/webhooks/order listens for.
 */
export async function createTiendaNubeDraftOrder(order: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
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

  return tiendaNubeFetch("/draft_orders", {
    method: "POST",
    body: JSON.stringify({
      contact_name: first_name,
      contact_lastname: last_name,
      contact_email: order.customerEmail,
      contact_phone: order.customerPhone,
      payment_status: "unpaid",
      products,
      note: `Pedido de coremarket.com.ar #${order.id} — retira en el local`,
    }),
  }) as Promise<{ id: number; checkout_url: string }>;
}

export type TiendaNubeProductDetail = {
  id: number;
  name: { es?: string; pt?: string };
  brand: string | null;
  categories: { id: number; name: { es?: string; pt?: string } }[];
  variants: {
    id: number;
    price: string | null;
    promotional_price: string | null;
    stock: number | null;
    stock_management: boolean;
    sku: string | null;
  }[];
  images: { id: number; src: string; position: number }[];
};

export async function getTiendaNubeProduct(productId: number) {
  return tiendaNubeFetch(`/products/${productId}`) as Promise<TiendaNubeProductDetail>;
}

/**
 * Extracts { price, compareAtPrice, stock } (in our own Int-pesos / whole-units
 * shape) from a TiendaNube product's first variant. TiendaNube's `price` is
 * the regular price and `promotional_price` is the discounted one when the
 * merchant has a sale running — our `price` is what the customer actually
 * pays, and `compareAtPrice` is the crossed-out original, so they're swapped
 * relative to TiendaNube's naming.
 */
export function readVariantPriceStock(product: TiendaNubeProductDetail) {
  const variant = product.variants[0];
  if (!variant) return null;

  const basePrice = variant.price != null ? parseFloat(variant.price) : null;
  const promoPrice = variant.promotional_price != null ? parseFloat(variant.promotional_price) : null;
  const onSale = promoPrice != null && basePrice != null && promoPrice < basePrice;

  return {
    price: onSale ? Math.round(promoPrice) : basePrice != null ? Math.round(basePrice) : null,
    compareAtPrice: onSale ? Math.round(basePrice) : null,
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
    ...(priceStock?.price != null
      ? { price: priceStock.price, compareAtPrice: priceStock.compareAtPrice }
      : {}),
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

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueProductSlug(name: string) {
  const base = slugify(name) || "producto";
  let slug = base;
  let i = 2;
  while (await db.product.findUnique({ where: { slug } })) {
    slug = `${base}-${i}`;
    i++;
  }
  return slug;
}

/** Best-effort match of a TiendaNube category to one of our own Category rows, falling back to the first (lowest-position) local category. */
async function resolveLocalCategoryId(product: TiendaNubeProductDetail) {
  const tnCategoryName = product.categories[0]?.name.es?.trim();
  if (tnCategoryName) {
    const match = await db.category.findFirst({
      where: { name: { equals: tnCategoryName, mode: "insensitive" } },
    });
    if (match) return match.id;
  }
  const fallback = await db.category.findFirst({ orderBy: { position: "asc" } });
  if (!fallback) throw new Error("No hay categorías locales configuradas");
  return fallback.id;
}

/** Best-effort match (or creation) of a Brand for a TiendaNube product's `brand` field, falling back to "Sin Marca". */
async function resolveLocalBrandId(product: TiendaNubeProductDetail) {
  const brandName = product.brand?.trim();
  if (!brandName) {
    const sinMarca = await db.brand.findUnique({ where: { slug: "sin-marca" } });
    if (sinMarca) return sinMarca.id;
  } else {
    const match = await db.brand.findFirst({ where: { name: { equals: brandName, mode: "insensitive" } } });
    if (match) return match.id;
    const slug = await (async () => {
      const base = slugify(brandName) || "marca";
      let candidate = base;
      let i = 2;
      while (await db.brand.findUnique({ where: { slug: candidate } })) {
        candidate = `${base}-${i}`;
        i++;
      }
      return candidate;
    })();
    const created = await db.brand.create({
      data: { slug, name: brandName, logo: `https://picsum.photos/seed/brand-${slug}/200/200` },
    });
    return created.id;
  }
  const fallback = await db.brand.findFirst({ orderBy: { name: "asc" } });
  if (!fallback) throw new Error("No hay marcas locales configuradas");
  return fallback.id;
}

/**
 * Builds a Prisma `Product.create` data object for a TiendaNube product that
 * has no local counterpart yet (used by the product/created webhook when the
 * merchant adds a brand-new product directly in TiendaNube). Resolves/creates
 * the local category and brand on a best-effort basis.
 */
export async function buildLocalCreateFromTiendaNube(product: TiendaNubeProductDetail) {
  const name = product.name.es?.trim() || product.name.pt?.trim() || `Producto TiendaNube ${product.id}`;
  const [categoryId, brandId] = await Promise.all([
    resolveLocalCategoryId(product),
    resolveLocalBrandId(product),
  ]);
  const [category, brand] = await Promise.all([
    db.category.findUnique({ where: { id: categoryId } }),
    db.brand.findUnique({ where: { id: brandId } }),
  ]);
  const brandName = brand?.name ?? "Sin Marca";
  const categoryName = category?.name ?? "";

  const variant = product.variants[0];
  const priceStock = readVariantPriceStock(product);
  const images = readProductImages(product) ?? [];

  let sku = variant?.sku?.trim() || null;
  if (sku && (await db.product.findUnique({ where: { sku } }))) {
    sku = null;
  }

  return {
    slug: await generateUniqueProductSlug(name),
    sku,
    name,
    shortDescription: brandName === "Sin Marca" ? categoryName : `${brandName} · ${categoryName}`,
    description: `${name}${brandName === "Sin Marca" ? "" : ` de ${brandName}`}. Disponible en Core Market.`,
    price: priceStock?.price ?? 0,
    compareAtPrice: priceStock?.compareAtPrice ?? null,
    stock: priceStock?.stock ?? 0,
    tiendaNubeProductId: product.id,
    tiendaNubeVariantId: variant?.id ?? null,
    categoryId,
    brandId,
    images: { create: images.map((url, i) => ({ url, alt: name, position: i })) },
  };
}

/**
 * Applies a TiendaNube product/created or product/updated event locally:
 * updates the linked product if one exists, links an unlinked local product
 * that shares its SKU, or creates a brand-new local product otherwise.
 *
 * The SKU fallback only claims a local product that isn't linked to any
 * TiendaNube product yet — some local products carry short placeholder SKUs
 * (not real barcodes) that a merchant could coincidentally reuse on an
 * unrelated new TiendaNube product, and relinking one of those would silently
 * repoint an already-synced product's price/stock source.
 */
export async function syncLocalProductFromTiendaNube(tnProduct: TiendaNubeProductDetail) {
  let product = await db.product.findFirst({ where: { tiendaNubeProductId: tnProduct.id } });

  if (!product) {
    const sku = tnProduct.variants[0]?.sku?.trim();
    if (sku) {
      const bySku = await db.product.findUnique({ where: { sku } });
      if (bySku && bySku.tiendaNubeProductId == null) {
        product = await db.product.update({
          where: { id: bySku.id },
          data: { tiendaNubeProductId: tnProduct.id, tiendaNubeVariantId: tnProduct.variants[0]?.id ?? null },
        });
      }
    }
  }

  if (product) {
    const data = buildLocalUpdateFromTiendaNube(tnProduct, product.name);
    return db.product.update({ where: { id: product.id }, data: { ...data, active: true } });
  }

  const createData = await buildLocalCreateFromTiendaNube(tnProduct);
  return db.product.create({ data: createData });
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
