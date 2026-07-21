"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBagOpen } from "@phosphor-icons/react/dist/ssr";
import type { ProductCard as ProductCardData } from "@/lib/queries";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { RatingStars } from "./rating-stars";

export function ProductCard({ product }: { product: ProductCardData }) {
  const [hovering, setHovering] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.has(product.id));

  const discountPct = product.compareAtPrice
    ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
    : null;

  return (
    <article
      className="group flex flex-col"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="relative aspect-square overflow-hidden rounded-card bg-sand-dark/40">
        <Link href={`/productos/${product.slug}`} className="block h-full w-full">
          <Image
            src={hovering && product.hoverImage ? product.hoverImage : product.image}
            alt={product.imageAlt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="rounded-full bg-olive-900 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-cream">
              Nuevo
            </span>
          )}
          {discountPct && discountPct > 0 && (
            <span className="rounded-full bg-gold px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-olive-900">
              -{discountPct}%
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            toggleWishlist({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.image,
            })
          }
          aria-pressed={inWishlist}
          aria-label={inWishlist ? "Quitar de favoritos" : "Agregar a favoritos"}
          className="absolute right-3 top-3 cursor-pointer rounded-full bg-cream/90 p-2 text-olive-900 shadow-soft backdrop-blur transition-colors hover:text-destructive"
        >
          <Heart size={16} weight={inWishlist ? "fill" : "regular"} />
        </button>

        <button
          type="button"
          disabled={product.stock === 0}
          onClick={() =>
            addItem({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.image,
              stock: product.stock,
            })
          }
          className={`absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold shadow-soft backdrop-blur transition-all duration-300 ${
            product.stock === 0
              ? "translate-y-0 cursor-not-allowed border border-olive-900/60 bg-cream text-olive-900 opacity-100"
              : "translate-y-2 cursor-pointer border border-transparent bg-cream/95 text-olive-900 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          }`}
        >
          <ShoppingBagOpen size={16} />
          {product.stock === 0 ? "Sin stock" : "Agregar"}
        </button>
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-olive-500">
          {product.brandName}
        </span>
        <Link
          href={`/productos/${product.slug}`}
          className="font-sans text-sm font-medium leading-snug text-olive-900 transition-colors hover:text-gold-dark"
        >
          {product.name}
        </Link>
        {product.reviewsCount > 0 && (
          <RatingStars rating={product.rating} count={product.reviewsCount} />
        )}
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-sans text-base font-semibold tabular-nums text-olive-900">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm tabular-nums text-olive-500 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
