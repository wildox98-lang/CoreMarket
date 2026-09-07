import { ProductCard } from "@/components/product/product-card";
import type { ProductCard as ProductCardData } from "@/lib/queries";

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
