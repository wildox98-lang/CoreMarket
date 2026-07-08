import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Truck, Storefront } from "@phosphor-icons/react/dist/ssr";
import { ImageGallery } from "@/components/product/image-gallery";
import { ProductDetailActions } from "@/components/product/product-detail-actions";
import { ProductTabs } from "@/components/product/product-tabs";
import { RatingStars } from "@/components/product/rating-stars";
import { ProductRail } from "@/components/home/product-rail";
import { SectionHeader } from "@/components/home/section-header";
import { formatPrice, formatTag } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id, 4);

  const ratings = product.reviews.map((r) => r.rating);
  const avgRating = ratings.length
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : 0;

  const tags = product.tags ? product.tags.split(",").filter(Boolean) : [];
  const nutritionFacts = product.nutritionFacts
    ? (JSON.parse(product.nutritionFacts) as Record<string, string>)
    : null;
  const discountPct = product.compareAtPrice
    ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: product.images.map((img) => img.url),
    brand: { "@type": "Brand", name: product.brand.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: product.price,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(ratings.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: ratings.length,
      },
    }),
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Miga de pan" className="mb-6 font-sans text-sm text-olive-500">
        <Link href="/productos" className="hover:text-olive-900">
          Productos
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/productos?categoria=${product.category.slug}`}
          className="hover:text-olive-900"
        >
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-olive-900">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <ImageGallery images={product.images} />

        <div className="flex flex-col gap-5">
          <div>
            <Link
              href={`/productos?marca=${product.brand.slug}`}
              className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark hover:underline"
            >
              {product.brand.name}
            </Link>
            <h1 className="mt-2 font-display text-3xl font-medium text-olive-900 sm:text-4xl">
              {product.name}
            </h1>
          </div>

          {ratings.length > 0 && (
            <div className="flex items-center gap-2">
              <RatingStars rating={avgRating} count={ratings.length} size={16} />
            </div>
          )}

          <div className="flex items-baseline gap-3">
            <span className="font-display text-3xl font-medium text-olive-900">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <>
                <span className="text-lg text-olive-500 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="rounded-full bg-gold px-2.5 py-1 text-xs font-semibold text-olive-900">
                  -{discountPct}%
                </span>
              </>
            )}
          </div>

          <p className="max-w-md font-sans text-base leading-relaxed text-olive-700/90">
            {product.shortDescription}
          </p>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-3 py-1 font-sans text-xs text-olive-700"
                >
                  {formatTag(tag)}
                </span>
              ))}
            </div>
          )}

          <ProductDetailActions
            productId={product.id}
            slug={product.slug}
            name={product.name}
            price={product.price}
            image={product.images[0]?.url ?? ""}
            stock={product.stock}
          />

          <div className="mt-2 flex flex-col gap-3 rounded-card bg-cream p-5 font-sans text-sm text-olive-700/90">
            <p className="flex items-center gap-2.5">
              <Truck size={18} className="shrink-0 text-gold-dark" />
              Envío a todo CABA y zona norte del GBA en 24–48hs.
            </p>
            <p className="flex items-center gap-2.5">
              <Storefront size={18} className="shrink-0 text-gold-dark" />
              Retiro gratis en nuestro local de Belgrano.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <ProductTabs
          description={product.description}
          nutritionFacts={nutritionFacts}
          reviews={product.reviews}
        />
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <SectionHeader eyebrow="También te puede interesar" title="Productos relacionados" />
          <div className="mt-10">
            <ProductRail products={related} />
          </div>
        </div>
      )}
    </div>
  );
}
