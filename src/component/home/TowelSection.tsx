import { cache } from "react";
import Link from "next/link";
import { productService } from "@/domain/application/services/product.service";
import ProductCard from "../ui/ProductCard";
import FadeIn from "../ui/FadeIn";
import BestSellingSlider from "./BestSellingSlider";

const getTowelProducts = cache(async () => {
  const map = new Map<string, any>();

  try {
    const resByCat = await productService.getPublicProducts({
      categories: ["6a3b7fd8c82609c09f2b7291"],
      page: 1,
      limit: 12,
    });
    (resByCat?.products ?? []).forEach((p) => map.set(p._id, p));
  } catch {
    // ignore
  }

  try {
    const resBySearch = await productService.getPublicProducts({
      search: "towel",
      page: 1,
      limit: 12,
    });
    (resBySearch?.products ?? []).forEach((p) => map.set(p._id, p));
  } catch {
    // ignore
  }

  return Array.from(map.values());
});

export default async function TowelSection() {
  let products: Awaited<ReturnType<typeof getTowelProducts>> = [];
  try {
    products = await getTowelProducts();
  } catch {
    products = [];
  }

  if (!products.length) return null;

  return (
    <section className="flex flex-col gap-6 sm:gap-8 py-8 sm:py-10 md:py-12 border-t border-gray-100">
      <FadeIn direction="up" className="text-center">
        <h2 className="inline-block bg-yellow-400 px-4 sm:px-6 py-1.5 sm:py-2 text-2xl sm:text-3xl md:text-4xl font-bold">
          TOWELS
        </h2>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Explore our premium collection of soft and absorbent towels
        </p>
        <Link
          href="/towels"
          className="mt-3 inline-block border border-gray-800 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide hover:bg-gray-800 hover:text-white transition-colors"
        >
          View All
        </Link>
      </FadeIn>

      <BestSellingSlider>
        {products.map((product, index) => (
          <FadeIn
            key={product._id}
            direction="up"
            delay={index * 100}
            className="w-[160px] sm:w-[200px] md:w-[240px] shrink-0 snap-start"
          >
            <ProductCard
              id={product._id}
              home
              isBestseller={product.isBestseller}
              wishlist
              size={product.sizes}
              imageSrc={product.imageUrls?.[0] ?? "/placeholder.png"}
              hoverImageSrc={product.imageUrls?.[1]}
              altText={product.name}
              categories={
                product.tags?.length
                  ? product.tags.join(", ")
                  : product.brand || "Towels"
              }
              title={product.name}
              originalPrice={product.price?.toFixed(2) ?? "0.00"}
              discountedPrice={product.salePrice?.toFixed(2) ?? "0.00"}
            />
          </FadeIn>
        ))}
      </BestSellingSlider>
    </section>
  );
}
