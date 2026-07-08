import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/ui/reveal";
import type { ProductCard as ProductCardData } from "@/lib/queries";

export function ProductRail({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) return null;

  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {products.map((product, i) => (
        <Reveal
          key={product.id}
          delay={i * 60}
          className="w-[70%] shrink-0 snap-start sm:w-[45%] lg:w-[23%]"
        >
          <ProductCard product={product} />
        </Reveal>
      ))}
    </div>
  );
}
