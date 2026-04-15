import Image from "next/image";
import Container from "../ui/Container";
import FadeIn from "../ui/FadeIn";

export default function TrendingGallery() {
  return (
    <Container>
      <section className="flex flex-col pt-10">
        <FadeIn direction="up" className="text-center pb-10">
          <h2 className="inline-block bg-yellow-400 px-6 py-2 text-4xl font-bold">
            Trendy Socks On Feet By Foot
          </h2>
          <p className="mt-2 text-gray-600">
            Preorder now to receive exclusive deals & gifts
          </p>
        </FadeIn>

        <div className="flex flex-row w-full gap-4 justify-between">
          {[
            { src: "/assets/images/product-1.png", alt: "Trending 1" },
            { src: "/assets/images/product-2.png", alt: "Trending 2" },
            { src: "/assets/images/product-3.png", alt: "Trending 3" },
            { src: "/assets/images/product-4.png", alt: "Trending 4" },
          ].map((img, index) => (
            <FadeIn key={img.src} direction="up" delay={index * 100}>
              <Image src={img.src} alt={img.alt} width={260} height={300} />
            </FadeIn>
          ))}
        </div>
      </section>
    </Container>
  );
}
