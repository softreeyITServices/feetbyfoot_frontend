// [category]/[product-slug]/[id]/page.tsx

import { productService } from "@/domain/application/services/product.service";
import ProductGallery from "./components/ProductGallery";
import ProductSummary from "./components/ProductSummary";
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
  const ratingResponse = await ratingService.getRatingsByProductId(id);

  const { product } = response;

  const {
    _id,
    name,
    salePrice,
    price,
    description,
    imageUrls,
    sizes,
  } = product;

  const products = {
    id: _id,
    name,
    price: salePrice,
    mrp: price,
    description,
    images: imageUrls,
    sizes,
    baseImage: imageUrls.length > 0 ? imageUrls[0] : "",
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ProductGallery images={products.images} />
        <ProductSummary
          product={products}
          totalRatings={ratingResponse?.totalRatings ?? 0}
          averageRating={ratingResponse?.averageRating ?? 0} />
      </section>

      <ProductTabs
        description={products.description}
        reviews={ratingResponse?.reviews ?? []}
        totalRatings={ratingResponse?.totalRatings ?? 0}
        averageRating={ratingResponse?.averageRating ?? 0}
      />
      {/* <RelatedProducts products={products} /> */}
    </main>
  );
}