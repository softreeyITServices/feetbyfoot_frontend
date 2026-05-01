import ProductCard from "@/component/ui/ProductCard";

interface RelatedProductsProps {
  products?: {
    id: string;
    imageSrc: string;
    altText: string;
    categories: string;
    title: string;
    originalPrice: string;
    discountedPrice: string;
    size: {
      _id?: string;
      size: string;
      quantity: number;
      isActive: boolean;
    }[];
  }[];
}
export default function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-8">
      {products?.map((product) => (
        <ProductCard
          key={product.id}
          wishlist={true}
          id={product.id}
          size={product.size}
          imageSrc={product.imageSrc}
          altText={product.altText}
          categories={product.categories}
          title={product.title}
          originalPrice={product.originalPrice}
          discountedPrice={product.discountedPrice} />
      ))}
    </section>
  );
}
