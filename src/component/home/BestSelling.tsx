import { cache } from "react";
import { productService } from "@/domain/application/services/product.service";
import Container from "../ui/Container";
import ProductCard from "../ui/ProductCard";
import FadeIn from "../ui/FadeIn";

// ✅ Inline cache (no extra files)
const getBestSellingProducts = cache(async () => {
  return productService.getPublicProducts({
    isBestseller: true,
    page: 1,
    limit: 6,
  });
});

export default async function BestSelling() {
  let products: Awaited<ReturnType<typeof getBestSellingProducts>>["products"] =
    [];
  try {
    const response = await getBestSellingProducts();
    products = response?.products ?? [];
  } catch {
    return null;
  }

  return (
    <Container>
      <section className="flex flex-col gap-8 py-12">
        <FadeIn direction="up" className="text-center">
          <h2 className="inline-block bg-yellow-400 px-6 py-2 text-4xl font-bold">
            Best Selling Socks
          </h2>
          <p className="mt-2 text-gray-600">
            Preorder now to receive exclusive deals & gifts
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product, index) => (
            <FadeIn key={product._id} direction="up" delay={index * 100}>
              <ProductCard
                id={product._id}
                home
                wishlist
                size={product.sizes}
                imageSrc={product.imageUrls?.[0] ?? "/placeholder.png"}
                altText={product.name}
                categories={product.tags?.join(", ") ?? ""}
                title={product.name}
                originalPrice={product.price?.toFixed(2) ?? "0.00"}
                discountedPrice={product.salePrice?.toFixed(2) ?? "0.00"}
              />
            </FadeIn>
          ))}
        </div>
      </section>
    </Container>
  );
}
