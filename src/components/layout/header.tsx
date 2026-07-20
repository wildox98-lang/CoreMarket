"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  List,
  MagnifyingGlass,
  Heart,
  ShoppingBag,
  X,
} from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/brand/logo";
import { NAV_LINKS } from "./nav-links";
import { useCartStore, useCartCount } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { CartDrawer } from "./cart-drawer";
import { MobileNav } from "./mobile-nav";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const cartCount = useCartCount();
  const openCart = useCartStore((s) => s.openCart);
  const wishlistCount = useWishlistStore((s) => s.items.length);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchOpen(false);
    router.push(`/productos${query ? `?q=${encodeURIComponent(query)}` : ""}`);
  }

  return (
    <>
      <header>
        <div className="hidden md:block bg-olive-900 text-cream">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-6 py-2 text-xs tracking-wide">
            <span>Retirá gratis en el local — por ahora no hacemos envíos</span>
          </div>
        </div>

        <div className="sticky top-0 z-40 border-b border-border/70 bg-sand/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="cursor-pointer p-2 -ml-2 text-olive-900 md:hidden"
              aria-label="Abrir menú"
            >
              <List size={24} />
            </button>

            <Logo />

            <nav className="hidden md:flex items-center gap-8 font-sans text-[0.95rem] text-olive-900">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative py-1 transition-colors hover:text-gold-dark after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-gold-dark after:transition-all after:duration-300 hover:after:w-full"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                className="cursor-pointer rounded-full p-2 text-olive-900 transition-colors hover:bg-sand-dark/60"
                aria-label="Buscar productos"
                aria-expanded={searchOpen}
              >
                <MagnifyingGlass size={22} />
              </button>
              <Link
                href="/favoritos"
                className="relative cursor-pointer rounded-full p-2 text-olive-900 transition-colors hover:bg-sand-dark/60"
                aria-label={`Favoritos (${wishlistCount})`}
              >
                <Heart size={22} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-olive-900">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={openCart}
                className="relative cursor-pointer rounded-full p-2 text-olive-900 transition-colors hover:bg-sand-dark/60"
                aria-label={`Carrito (${cartCount} productos)`}
              >
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-olive-900">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className="border-t border-border/70 bg-cream px-4 py-3 sm:px-6">
              <form
                onSubmit={handleSearch}
                className="mx-auto flex max-w-7xl items-center gap-3"
              >
                <MagnifyingGlass
                  size={20}
                  className="shrink-0 text-olive-500"
                />
                <input
                  autoFocus
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar proteína, creatina, snacks..."
                  className="w-full bg-transparent py-1 text-base text-charcoal placeholder:text-olive-500/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 rounded"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="cursor-pointer p-1 text-olive-500"
                  aria-label="Cerrar búsqueda"
                >
                  <X size={20} />
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CartDrawer />
    </>
  );
}
