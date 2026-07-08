// [category]/[product-slug]/[id]/page.tsx

import { productService } from "@/domain/application/services/product.service";
import ProductDetailView from "./components/ProductDetailView";
import ProductTabs from "./components/ProductTabs";
import RelatedProducts from "./components/RelatedProducts";
import { ratingService } from "@/domain/application/services/rating.service";

interface ProductPageProps {
  params: {
    category: string;
    "product-slug": string;
    id: string;
  };
}

const isValidObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  if (!isValidObjectId(id)) {
    return;
  }

  const response = await productService.getProductById(id);
  console.log("response", response);
  const ratingResponse = await ratingService.getRatingsByProductId(id);

  const { product, categoriesProducts } = response;

  const {
    _id,
    name,
    salePrice,
    price,
    description,
    imageUrls,
    sizes,
    colorDetails,
    brand
  } = product;

  const products = {
    id: _id,
    name,
    price: salePrice,
    mrp: price,
    description,
    images: imageUrls,
    sizes,
    colorDetails,
    baseImage: imageUrls.length > 0 ? imageUrls[0] : "",
  };

  const relatedProducts = categoriesProducts?.map((p: any) => ({
    id: p._id,
    imageSrc: p.imageUrls?.[0] || "",
    altText: p.name,
    categories: p.brand || "products",
    title: p.name,
    originalPrice: p.price,
    discountedPrice: p.salePrice || p.price,
    size: p.sizes || [],
  })) || [];

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <ProductDetailView
        product={products}
        totalRatings={ratingResponse?.totalRatings ?? 0}
        averageRating={ratingResponse?.averageRating ?? 0}
        reviews={ratingResponse?.reviews ?? []}
      />

      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-8">Related Products</h2>
          <RelatedProducts products={relatedProducts} />
        </div>
      )}
    </main>
  );
}