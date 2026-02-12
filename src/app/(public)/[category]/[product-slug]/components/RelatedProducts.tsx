import ProductCard from "@/component/ui/ProductCard";

interface RelatedProductsProps {
  products?: {
    imageSrc: string;
    altText: string;
    categories: string;
    title: string;
    originalPrice: string;
    discountedPrice: string;
  }[];
}
export default function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
      {products?.map((product, i) => (
        <ProductCard key={i.toString()} size="" imageSrc={product.imageSrc} altText={product.altText} categories={product.categories} title={product.title} originalPrice={product.originalPrice} discountedPrice={product.discountedPrice} />
      ))}
    </section>
  );
}
