import type { Metadata } from "next";
import { productService } from "@/domain/application/services/product.service";
import ProductDetailView from "./components/ProductDetailView";
import ProductTabs from "./components/ProductTabs";
import RelatedProducts from "./components/RelatedProducts";
import { ratingService } from "@/domain/application/services/rating.service";
import { formatImageUrl } from "@/lib/imageUrlFormatter";

interface ProductPageProps {
  params: {
    category: string;
    "product-slug": string;
    id: string;
  };
}

const isValidObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return { title: "Product Not Found | Feet by Foot" };
  }

  try {
    const response = await productService.getProductById(id);
    const product = response?.product;
    if (!product) return { title: "Product | Feet by Foot" };

    const title = `${product.name} | Feet by Foot`;
    const description = product.description
      ? product.description.slice(0, 155)
      : `Shop ${product.name} online at Feet by Foot. Premium quality footwear.`;
    const firstImage = product.imageUrls?.[0] ? formatImageUrl(product.imageUrls[0]) : "";

    return {
      title,
      description,
      keywords: product.tags?.length ? product.tags : ["feet by foot", "footwear", product.name],
      openGraph: {
        title,
        description,
        type: "article",
        images: firstImage ? [{ url: firstImage, alt: product.name }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: firstImage ? [firstImage] : [],
      },
    };
  } catch (error) {
    return { title: "Product | Feet by Foot" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  if (!isValidObjectId(id)) {
    return;
  }

  const response = await productService.getProductById(id);
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

  const formattedImages = imageUrls?.map((img: string) => formatImageUrl(img)) || [];

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": name,
    "image": formattedImages,
    "description": description,
    "brand": {
      "@type": "Brand",
      "name": brand || "Feet by Foot",
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": salePrice || price,
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
    },
    ...(ratingResponse?.totalRatings > 0
      ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": ratingResponse.averageRating,
            "reviewCount": ratingResponse.totalRatings,
          },
        }
      : {}),
  };

  return (
    <main className="max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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