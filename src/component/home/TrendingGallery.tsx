import Image from "next/image";
import Container from "../ui/Container";

export default function TrendingGallery() {
  return (
    <Container>
      <section className="flex flex-col pt-10">
        <div className="text-center pb-10">
          <h2 className="inline-block bg-yellow-400 px-6 py-2 text-4xl font-bold">
            Trendy Socks On Feet By Foot
          </h2>
          <p className="mt-2 text-gray-600">
            Preorder now to receive exclusive deals & gifts
          </p>
        </div>

        <div className="flex flex-row w-full gap-4 justify-between">
          <Image src="/assets/images/product-1.png" alt="Trending 1" width={260} height={300} />
          <Image src="/assets/images/product-2.png" alt="Trending 2" width={260} height={300} />
          <Image src="/assets/images/product-3.png" alt="Trending 3" width={260} height={300} />
          <Image src="/assets/images/product-4.png" alt="Trending 4" width={260} height={300} />
        </div>
      </section>
    </Container>
  );
}
