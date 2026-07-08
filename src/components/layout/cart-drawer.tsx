"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash, X } from "@phosphor-icons/react/dist/ssr";
import { useCartStore, useCartSubtotal } from "@/lib/store/cart";
import { formatPrice } from "@/lib/format";
import { STORE } from "@/lib/constants";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartSubtotal();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const missingForFreeShipping = Math.max(
    STORE.freeShippingThreshold - subtotal,
    0,
  );

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-olive-900/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCart}
      />
      <div
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-lift transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Carrito de compras"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-xl font-medium text-olive-900">
            Tu carrito
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="cursor-pointer p-2 text-olive-900"
            aria-label="Cerrar carrito"
          >
            <X size={22} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-display text-lg italic text-olive-500">
              Todavía no agregaste productos.
            </p>
            <Link
              href="/productos"
              onClick={closeCart}
              className="cursor-pointer rounded-full bg-olive-700 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-olive-900"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {missingForFreeShipping > 0 ? (
                <p className="mb-4 rounded-xl bg-sand-dark/50 px-4 py-2.5 text-xs text-olive-700">
                  Te faltan {formatPrice(missingForFreeShipping)} para envío
                  gratis.
                </p>
              ) : (
                <p className="mb-4 rounded-xl bg-olive-700/10 px-4 py-2.5 text-xs font-medium text-olive-700">
                  ¡Tenés envío gratis en este pedido!
                </p>
              )}
              <ul className="flex flex-col gap-5">
                {items.map((item) => (
                  <li key={item.productId} className="flex gap-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sand-dark">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/productos/${item.slug}`}
                          onClick={closeCart}
                          className="text-sm font-medium text-olive-900 hover:text-gold-dark"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="cursor-pointer text-olive-500 hover:text-destructive"
                          aria-label={`Quitar ${item.name}`}
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                      <span className="text-sm text-olive-500">
                        {formatPrice(item.price)}
                      </span>
                      <div className="mt-1 inline-flex w-fit items-center gap-3 rounded-full border border-border px-2 py-1">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.productId, item.quantity - 1)
                          }
                          className="cursor-pointer text-olive-700"
                          aria-label="Restar cantidad"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-4 text-center text-sm tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.productId, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock}
                          className="cursor-pointer text-olive-700 disabled:opacity-30"
                          aria-label="Sumar cantidad"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border px-5 py-5">
              <div className="mb-4 flex items-center justify-between font-sans text-base">
                <span className="text-olive-700">Subtotal</span>
                <span className="font-semibold tabular-nums text-olive-900">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block cursor-pointer rounded-full bg-gold px-6 py-3.5 text-center text-sm font-semibold text-olive-900 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              >
                Finalizar compra
              </Link>
              <p className="mt-2 text-center text-xs text-olive-500">
                Envío o retiro se calculan en el checkout.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
