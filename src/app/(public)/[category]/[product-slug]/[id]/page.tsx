// [category]/[product-slug]/[id]/page.tsx

import { productService } from "@/domain/application/services/product.service";
import ProductGallery from "./components/ProductGallery";
import ProductSummary from "./components/ProductSummary";
import ProductTabs from "./components/ProductTabs";
import RelatedProducts from "./components/RelatedProducts";

interface ProductPageProps {
  params: {
    category: string;
    "product-slug": string;
    id: string;
  };
}

const isValidObjectId = (id: string) =>
  /^[a-f\d]{24}$/i.test(id);

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  if (!isValidObjectId(id)) {
    return;
  }
  const response = await productService.getProductById(id);
  const data = response

  const product = {
    name: data.name,
    price: data.salePrice,     // show discounted price
    mrp: data.price,           // original price
    description: data.description,
    images: data.imageUrls,    // correct field
    sizes: data.sizes,
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ProductGallery images={product.images} />
        <ProductSummary product={product} />
      </section>

      <ProductTabs description={product.description} />
      {/* <RelatedProducts products={products} /> */}
    </main>
  );
}
