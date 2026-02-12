import Image from "next/image";
import Container from "../ui/Container";
import ProductCard from "../ui/ProductCard";

export default function BestSelling() {

  const products = [
    {
      imageSrc: "/assets/images/product-1.png",
      altText: "Grey Woolen Socks",
      categories: "Womens, Crew, Mens, Winter",
      title: "Grey & Black Checked Woolen Socks | Soft Fleece-Lined Warm Winter Socks",
      originalPrice: "299.00",
      discountedPrice: "209.00",
    },
    {
      imageSrc: "/assets/images/product-2.png",
      altText: "Reindeer Pattern Socks",
      categories: "Womens, Crew, Winter Socks",
      title: "Winter Reindeer Pattern Woolen Socks – Cozy Warm Thermal Socks",
      originalPrice: "299.00",
      discountedPrice: "199.00",
    },
    {
      imageSrc: "/assets/images/product-3.png",
      altText: "Navy Blue Crew Socks",
      categories: "Mens, Crew, Winter Socks",
      title: "Classic Navy Blue Woolen Crew Socks – Soft, Durable & Everyday Comfort",
      originalPrice: "299.00",
      discountedPrice: "199.00",
    },
  ];


  return (
    <Container>
      <section className="flex flex-col gap-8 py-12">

        {/* Heading */}
        <div className="text-center">
          <h2 className="inline-block bg-yellow-400 px-6 py-2 text-4xl font-bold">
            Best Selling Socks
          </h2>
          <p className="mt-2 text-gray-600">
            Preorder now to receive exclusive deals & gifts
          </p>
        </div>

        {/* FLEX LAYOUT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

          {products.map((product, index) => (
            <ProductCard
              key={index.toString()}
              size=""
              imageSrc={product.imageSrc}
              altText={product.altText}
              categories={product.categories}
              title={product.title}
              originalPrice={product.originalPrice}
              discountedPrice={product.discountedPrice}
            />
          ))}

        </div>
      </section>
    </Container>
  );
}
