import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

const productCardInclude = {
  images: { orderBy: { position: "asc" as const }, take: 2 },
  reviews: { select: { rating: true } },
  brand: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ProductInclude;

type ProductWithCardData = Prisma.ProductGetPayload<{
  include: typeof productCardInclude;
}>;

export type ProductCard = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  imageAlt: string;
  hoverImage: string | null;
  stock: number;
  tags: string[];
  isNew: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewsCount: number;
  brandName: string;
  categoryName: string;
  categorySlug: string;
};

export function toProductCard(product: ProductWithCardData): ProductCard {
  const ratings = product.reviews.map((r) => r.rating);
  const rating = ratings.length
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    image: product.images[0]?.url ?? "",
    imageAlt: product.images[0]?.alt ?? product.name,
    hoverImage: product.images[1]?.url ?? null,
    stock: product.stock,
    tags: product.tags ? product.tags.split(",").filter(Boolean) : [],
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    rating,
    reviewsCount: ratings.length,
    brandName: product.brand.name,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
  };
}

/** Pass a brandSlug to only return categories that have products from that brand. */
export async function getCategories(brandSlug?: string) {
  return db.category.findMany({
    where: brandSlug ? { products: { some: { active: true, brand: { slug: brandSlug } } } } : undefined,
    orderBy: { position: "asc" },
  });
}

/** Pass a categorySlug to only return brands that have products in that category. */
export async function getBrands(categorySlug?: string) {
  return db.brand.findMany({
    where: categorySlug ? { products: { some: { active: true, category: { slug: categorySlug } } } } : undefined,
    orderBy: { name: "asc" },
  });
}

export async function getProductBySlug(slug: string) {
  const product = await db.product.findUnique({
    where: { slug, active: true },
    include: {
      images: { orderBy: { position: "asc" } },
      reviews: { orderBy: { createdAt: "desc" } },
      brand: true,
      category: true,
    },
  });
  return product;
}

export async function getRelatedProducts(categoryId: string, excludeId: string, take = 4) {
  const products = await db.product.findMany({
    where: { categoryId, id: { not: excludeId }, active: true },
    include: productCardInclude,
    take,
  });
  return products.map(toProductCard);
}

export type ProductFilters = {
  q?: string;
  categoria?: string;
  marca?: string;
  tag?: string;
  sort?: "relevancia" | "precio-asc" | "precio-desc" | "novedades" | "descuentos" | "az";
  page?: number;
};

const PAGE_SIZE = 12;

export async function getFilteredProducts(filters: ProductFilters) {
  const where: Prisma.ProductWhereInput = { active: true };

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { shortDescription: { contains: filters.q, mode: "insensitive" } },
      { tags: { contains: filters.q, mode: "insensitive" } },
    ];
  }
  if (filters.categoria) {
    where.category = { slug: filters.categoria };
  }
  if (filters.marca) {
    where.brand = { slug: filters.marca };
  }
  if (filters.tag) {
    where.tags = { contains: filters.tag, mode: "insensitive" };
  }
  if (filters.sort === "descuentos") {
    where.compareAtPrice = { not: null };
  }

  // A second sort key (id) is required: without it, rows tied on the primary
  // key (e.g. almost every product has featured: false) come back in a
  // non-deterministic order, so the same product can show up on more than
  // one page while others get skipped.
  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    filters.sort === "precio-asc"
      ? [{ price: "asc" }, { id: "asc" }]
      : filters.sort === "precio-desc"
        ? [{ price: "desc" }, { id: "asc" }]
        : filters.sort === "novedades"
          ? [{ createdAt: "desc" }, { id: "asc" }]
          : filters.sort === "descuentos"
            ? [{ compareAtPrice: "desc" }, { id: "asc" }]
            : filters.sort === "relevancia"
              ? [{ featured: "desc" }, { id: "asc" }]
              : [{ name: "asc" }, { id: "asc" }];

  const page = Math.max(filters.page ?? 1, 1);

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: productCardInclude,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count({ where }),
  ]);

  return {
    products: products.map(toProductCard),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(Math.ceil(total / PAGE_SIZE), 1),
  };
}
