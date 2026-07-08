import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const STATIC_ROUTES = ["", "/productos", "/nosotros", "/tienda", "/faq", "/contacto"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://coremarket.com.ar";
  const products = await db.product.findMany({ select: { slug: true, updatedAt: true } });

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
    })),
    ...products.map((p) => ({
      url: `${baseUrl}/productos/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ];
}
