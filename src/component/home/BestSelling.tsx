import { cache } from "react";
import Link from "next/link";
import { productService } from "@/domain/application/services/product.service";
import Container from "../ui/Container";
import ProductCard from "../ui/ProductCard";
import FadeIn from "../ui/FadeIn";
import BestSellingSlider from "./BestSellingSlider";

// ✅ Inline cache (no extra files)
const getBestSellingProducts = cache(async () => {
  return productService.getPublicProducts({
    isBestseller: true,
    page: 1,
    limit: 12,
  });
});

export default async function BestSelling() {
  let products: Awaited<ReturnType<typeof getBestSellingProducts>>["products"] =
    [];
  try {
    const response = await getBestSellingProducts();
    const raw = response?.products ?? [];
    // Spread across categories: round-robin so neighbours differ.
    const byCat = new Map<string, typeof raw>();
    for (const pr of raw) {
      const key = (pr as any).category ?? "other";
      if (!byCat.has(key)) byCat.set(key, []);
      byCat.get(key)!.push(pr);
    }
    const buckets = Array.from(byCat.values());
    const spread: typeof raw = [];
    let i = 0;
    while (spread.length < raw.length) {
      const b = buckets[i % buckets.length];
      if (b.length) spread.push(b.shift()!);
      i++;
      if (buckets.every((x) => x.length === 0)) break;
    }
    products = spread.slice(0, 8);
  } catch {
    return null;
  }

  return (
    // <Container>
      <section className="flex flex-col gap-6 sm:gap-8 py-8 sm:py-10 md:py-12">
        <FadeIn direction="up" className="text-center">
          <h2 className="inline-block bg-yellow-400 px-4 sm:px-6 py-1.5 sm:py-2 text-2xl sm:text-3xl md:text-4xl font-bold">
            BEST SELLERS
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Preorder now to receive exclusive deals & gifts
          </p>
          <Link href="/shop?isBestseller=true" className="mt-3 inline-block border border-gray-800 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide hover:bg-gray-800 hover:text-white transition-colors">View All</Link>
        </FadeIn>

        <BestSellingSlider>
          {products.map((product, index) => (
            <FadeIn key={product._id} direction="up" delay={index * 100} className="w-[160px] sm:w-[200px] md:w-[240px] shrink-0 snap-start">
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
                    : product.brand || "Socks"
                }
                title={product.name}
                originalPrice={product.price?.toFixed(2) ?? "0.00"}
                discountedPrice={product.salePrice?.toFixed(2) ?? "0.00"}
              />
            </FadeIn>
          ))}
        </BestSellingSlider>
      </section>
    // </Container>
  );
}