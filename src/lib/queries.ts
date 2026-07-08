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

export async function getFeaturedProducts(take = 4) {
  const products = await db.product.findMany({
    where: { featured: true },
    include: productCardInclude,
    take,
    orderBy: { createdAt: "desc" },
  });
  return products.map(toProductCard);
}

export async function getBestSellers(take = 8) {
  const products = await db.product.findMany({
    where: { isBestSeller: true },
    include: productCardInclude,
    take,
    orderBy: { createdAt: "desc" },
  });
  return products.map(toProductCard);
}

export async function getNewArrivals(take = 8) {
  const products = await db.product.findMany({
    where: { isNew: true },
    include: productCardInclude,
    take,
    orderBy: { createdAt: "desc" },
  });
  return products.map(toProductCard);
}

export async function getPromotions(take = 8) {
  const products = await db.product.findMany({
    where: { compareAtPrice: { not: null } },
    include: productCardInclude,
    take,
    orderBy: { createdAt: "desc" },
  });
  return products.map(toProductCard);
}

const HEALTHY_FOOD_CATEGORIES = [
  "superalimentos",
  "frutos-secos-semillas",
  "snacks-saludables",
  "bienestar-natural",
];

export async function getHealthyFoodProducts(take = 8) {
  const products = await db.product.findMany({
    where: { category: { slug: { in: HEALTHY_FOOD_CATEGORIES } } },
    include: productCardInclude,
    take,
    orderBy: { createdAt: "desc" },
  });
  return products.map(toProductCard);
}

export async function getCategories() {
  return db.category.findMany({ orderBy: { position: "asc" } });
}

export async function getBrands() {
  return db.brand.findMany({ orderBy: { name: "asc" } });
}

export async function getProductBySlug(slug: string) {
  const product = await db.product.findUnique({
    where: { slug },
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
    where: { categoryId, id: { not: excludeId } },
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
  sort?: "relevancia" | "precio-asc" | "precio-desc" | "novedades";
  page?: number;
};

const PAGE_SIZE = 12;

export async function getFilteredProducts(filters: ProductFilters) {
  const where: Prisma.ProductWhereInput = {};

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q } },
      { shortDescription: { contains: filters.q } },
      { tags: { contains: filters.q } },
    ];
  }
  if (filters.categoria) {
    where.category = { slug: filters.categoria };
  }
  if (filters.marca) {
    where.brand = { slug: filters.marca };
  }
  if (filters.tag) {
    where.tags = { contains: filters.tag };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filters.sort === "precio-asc"
      ? { price: "asc" }
      : filters.sort === "precio-desc"
        ? { price: "desc" }
        : filters.sort === "novedades"
          ? { createdAt: "desc" }
          : { featured: "desc" };

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
