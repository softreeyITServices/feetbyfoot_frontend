import ProductGallery from "./components/ProductGallery";
import ProductSummary from "./components/ProductSummary";
import ProductTabs from "./components/ProductTabs";
import RelatedProducts from "./components/RelatedProducts";

export default async function ProductPage() {
  // mock data for now (replace with API later)
  const product = {
    name: "Men’s Premium Black Ankle Woolen Socks With Contrast Double Sport Stripe",
    price: 649,
    mrp: 1299,
    description:
      "Upgrade your everyday comfort with this Pack of 5 Women's Cute Cotton Ankle Socks.",
    images: [
      "/assets/images/product-1.png",
      "/assets/images/product-2.png",
      "/assets/images/product-3.png",
      "/assets/images/product-4.png",
    ],
    sizes: [
      "UK 4-7 (US 5-7.5 | EU 37-40)",
      "UK 7-10 (US 8-12 | EU 40-47)",
    ],
  };

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
    <main className="max-w-7xl mx-auto px-4 py-10">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ProductGallery images={product.images} />
        <ProductSummary product={product} />
      </section>

      <ProductTabs />
      <RelatedProducts products={products} />
    </main>
  );
}
