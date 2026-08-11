import Image from "next/image";
import FadeIn from "../ui/FadeIn";
import Link from "next/link";
import HomeBlogSection from "./HomeBlogSection";

export default function TrendingGallery() {
  const images = [
    { src: "/assets/images/product-1.png", alt: "Trending 1" },
    { src: "/assets/images/product-2.png", alt: "Trending 2" },
    { src: "/assets/images/product-3.png", alt: "Trending 3" },
    { src: "/assets/images/product-4.png", alt: "Trending 4" },
  ];

  return (
    <section className="flex flex-col pt-6 sm:pt-8 md:pt-10 w-full px-1 sm:px-2">
        <FadeIn
          direction="up"
          className="text-center pb-6 sm:pb-8 md:pb-10 px-4"
        >
          <h2 className="inline-block bg-yellow-400 px-4 sm:px-6 py-1.5 sm:py-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
            Trendy Socks On <br className="sm:hidden" /> Feet By Foot
          </h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600">
            Preorder now to receive exclusive deals & gifts
          </p>
        </FadeIn>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 px-1 sm:px-0">
          {images.map((img, index) => (
            <FadeIn
              key={img.src}
              direction="up"
              delay={index * 100}
            >
              <div
                className="relative w-full aspect-[3/4] overflow-hidden rounded-lg sm:rounded-xl"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                />
                {/* Optional overlay on hover */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 rounded-lg sm:rounded-xl" />
              </div>
            </FadeIn>
          ))}
        </div>

        {/* View All Button */}

        <FadeIn
          direction="up"
          delay={400}
          className="text-center mt-6 sm:mt-8 md:mt-10"
        >
          <Link href="/shop" passHref>
            <button className="bg-black text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-800 transition-colors">
              View All Products
            </button>
          </Link>
        </FadeIn>

        <HomeBlogSection />
      </section>
  );
}
