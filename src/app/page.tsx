import { Hero } from "@/components/home/hero";
import { StatsBar } from "@/components/home/stats-bar";
import { CategoriesGrid } from "@/components/home/categories-grid";
import { SectionHeader } from "@/components/home/section-header";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductRail } from "@/components/home/product-rail";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { BrandsStrip } from "@/components/home/brands-strip";
import { Testimonials } from "@/components/home/testimonials";
import { AboutTeaser } from "@/components/home/about-teaser";
import { StoreLocation } from "@/components/home/store-location";
import { FaqTeaser } from "@/components/home/faq-teaser";
import { InstagramSection } from "@/components/home/instagram-section";
import { NewsletterBanner } from "@/components/home/newsletter-banner";
import {
  getBestSellers,
  getBrands,
  getCategories,
  getFeaturedProducts,
  getHealthyFoodProducts,
  getNewArrivals,
  getPromotions,
} from "@/lib/queries";

export default async function Home() {
  const [
    categories,
    brands,
    featured,
    promotions,
    healthyFoods,
    bestSellers,
    newArrivals,
  ] = await Promise.all([
    getCategories(),
    getBrands(),
    getFeaturedProducts(4),
    getPromotions(8),
    getHealthyFoodProducts(8),
    getBestSellers(8),
    getNewArrivals(8),
  ]);

  return (
    <>
      <Hero />
      <StatsBar />
      <CategoriesGrid categories={categories} />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeader
          eyebrow="Lo esencial"
          title="Elegidos por nuestro equipo"
          description="La selección de productos que más recomendamos, mes a mes, según nuestra propia experiencia entrenando."
          href="/productos"
        />
        <div className="mt-10">
          <ProductGrid products={featured} />
        </div>
      </section>

      {promotions.length > 0 && (
        <section className="bg-cream">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <SectionHeader
              eyebrow="Ofertas"
              title="Ofertas de la semana"
              description="Precios especiales por tiempo limitado, mientras dure el stock disponible."
              href="/productos"
            />
            <div className="mt-10">
              <ProductRail products={promotions} />
            </div>
          </div>
        </section>
      )}

      <WhyChooseUs />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeader
          eyebrow="Alimentación real"
          title="Comida de verdad, sin vueltas"
          description="Semillas, legumbres, frutos secos y granolas pensados para acompañar tu día, no solo tu entrenamiento."
          href="/productos"
        />
        <div className="mt-10">
          <ProductGrid products={healthyFoods} />
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <SectionHeader
            eyebrow="Los más elegidos"
            title="Lo que más se lleva la comunidad"
            href="/productos"
          />
          <div className="mt-10">
            <ProductRail products={bestSellers} />
          </div>
        </div>
      </section>

      <BrandsStrip brands={brands} />

      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20">
          <SectionHeader
            eyebrow="Recién llegado"
            title="Las últimas incorporaciones"
            href="/productos"
          />
          <div className="mt-10">
            <ProductGrid products={newArrivals} />
          </div>
        </section>
      )}

      <Testimonials />
      <AboutTeaser />
      <StoreLocation />
      <FaqTeaser />
      <InstagramSection />
      <NewsletterBanner />
    </>
  );
}
