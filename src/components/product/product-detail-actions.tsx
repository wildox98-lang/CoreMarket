"use client";

import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBagOpen } from "@phosphor-icons/react/dist/ssr";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";

export function ProductDetailActions({
  productId,
  slug,
  name,
  price,
  image,
  stock,
}: {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.has(productId));

  return (
    <div className="flex flex-col gap-4">
      {stock > 0 ? (
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center gap-4 rounded-full border border-border px-4 py-2.5">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="cursor-pointer text-olive-700"
              aria-label="Restar cantidad"
            >
              <Minus size={16} />
            </button>
            <span className="w-5 text-center tabular-nums text-olive-900">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
              className="cursor-pointer text-olive-700"
              aria-label="Sumar cantidad"
              disabled={quantity >= stock}
            >
              <Plus size={16} />
            </button>
          </div>
          <span className="font-sans text-xs text-olive-500">{stock} disponibles</span>
        </div>
      ) : (
        <p className="font-sans text-sm font-medium text-destructive">
          Sin stock por el momento
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          disabled={stock === 0}
          onClick={() => addItem({ productId, slug, name, price, image, stock }, quantity)}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-olive-900 px-6 py-3.5 font-sans text-sm font-semibold text-cream transition-colors hover:bg-olive-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingBagOpen size={18} />
          {stock === 0 ? "Sin stock" : "Agregar al carrito"}
        </button>
        <button
          type="button"
          onClick={() => toggleWishlist({ productId, slug, name, price, image })}
          aria-pressed={inWishlist}
          aria-label={inWishlist ? "Quitar de favoritos" : "Agregar a favoritos"}
          className="flex h-[52px] w-[52px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-olive-900 transition-colors hover:border-destructive hover:text-destructive"
        >
          <Heart size={20} weight={inWishlist ? "fill" : "regular"} />
        </button>
      </div>
    </div>
  );
}
