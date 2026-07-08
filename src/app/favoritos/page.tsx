"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBagOpen, Trash } from "@phosphor-icons/react/dist/ssr";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/format";

export default function FavoritosPage() {
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="font-display text-4xl font-medium text-olive-900">Tus favoritos</h1>
      <p className="mt-2 font-sans text-base text-olive-700/80">
        Los productos que guardaste para más tarde.
      </p>

      {items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="font-display text-xl italic text-olive-500">
            Todavía no agregaste favoritos.
          </p>
          <Link
            href="/productos"
            className="cursor-pointer rounded-full bg-olive-900 px-6 py-3 font-sans text-sm font-semibold text-cream transition-colors hover:bg-olive-700"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <ul className="mt-10 flex flex-col divide-y divide-border">
          {items.map((item) => (
            <li key={item.productId} className="flex items-center gap-4 py-5">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sand-dark">
                <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <Link
                  href={`/productos/${item.slug}`}
                  className="font-sans text-sm font-medium text-olive-900 hover:text-gold-dark"
                >
                  {item.name}
                </Link>
                <span className="font-sans text-sm text-olive-500">
                  {formatPrice(item.price)}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  addItem({
                    productId: item.productId,
                    slug: item.slug,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    stock: 999,
                  })
                }
                className="flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 font-sans text-sm font-medium text-olive-900 transition-colors hover:border-olive-700"
              >
                <ShoppingBagOpen size={16} />
                Agregar
              </button>
              <button
                type="button"
                onClick={() => remove(item.productId)}
                aria-label={`Quitar ${item.name} de favoritos`}
                className="cursor-pointer p-2 text-olive-500 transition-colors hover:text-destructive"
              >
                <Trash size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
