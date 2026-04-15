import Image from "next/image";
import Container from "../ui/Container";
import { UpRightArrowIcon } from "@/icons/UpRightArrowIcon";
import Link from "next/link";
import FadeIn from "../ui/FadeIn";

export default function ShopByCategory() {
  return (
    <section className="section py-16">
      <Container>

        {/* PARENT GRID WITH 3 COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* COLUMN 1 */}
          <FadeIn direction="up" className="grid grid-cols-1 gap-10 content-start">
            <h2 className="text-4xl font-semibold text-green-900 leading-tight">
              Shop By <br /> Category
            </h2>

            {/* GAP BELOW TITLE */}
            <div className="mt-6 relative rounded-xl overflow-hidden">
              <Image
                src="/assets/images/masonary_img_1.png"
                alt="Kids Socks"
                width={300}
                height={450}
                className="w-80 h-120 object-cover rounded-xl"
              />
              <Link href="/kids">

                <button className="absolute bottom-4 left-4 bg-yellow-400 p-1 rounded text-[13px] font-semibold flex flex-row gap-2 justify-center items-center">
                  <span className="text-lg">Kids Socks</span> <UpRightArrowIcon width={24} height={24} />
                </button>
              </Link>
            </div>
          </FadeIn>

          {/* COLUMN 2 (GRID FLOW DOWNWARDS) */}
          <FadeIn direction="up" delay={150} className="grid grid-cols-1 gap-6 content-start">

            {/* Gift Packs */}
            <div className="relative rounded-xl overflow-hidden">
              <Image
                src="/assets/images/masonary_img_2.png"
                alt="Socks Gift Packs"
                width={300}
                height={450}
                className="w-80 h-120 object-cover rounded-xl"
              />
              <Link href="/gifts">
                <button className="absolute bottom-4 left-4 bg-yellow-400 p-1 rounded text-[13px] font-semibold flex flex-row gap-2 justify-center items-center">
                  <span className="text-lg">Socks Gift Packs</span> <UpRightArrowIcon width={24} height={24} />
                </button>
              </Link>
            </div>

            {/* Women Floral Socks (Tall) */}
            <div className="relative rounded-xl overflow-hidden">
              <Image
                src="/assets/images/masonary_img_3.png"
                alt="Women Food & Florals Socks"
                width={300}
                height={450}
                className="w-80 h-120 object-cover rounded-xl"
              />
              <Link href="/womens">

                <button className="absolute bottom-4 left-4 bg-yellow-400 p-1 rounded text-[13px] font-semibold flex flex-row gap-2 justify-center items-center">
                  <span className="text-lg">Women Food & Florals Socks</span> <UpRightArrowIcon width={24} height={24} />
                </button>
              </Link>
            </div>

          </FadeIn>

          {/* COLUMN 3 (FLOW DOWN, BUT WITH TOP GAP FIRST) */}
          <FadeIn direction="up" delay={300} className="grid grid-cols-1 gap-14 content-start">

            {/* TOP GAP FOR STAGGER EFFECT */}
            <div className="h-20"></div>

            {/* Men Funky Socks */}
            <div className="relative rounded-xl overflow-hidden">
              <Image
                src="/assets/images/masonary_img_4.png"
                alt="Men Funky Socks"
                width={300}
                height={450}
                className="w-80 h-120 object-cover rounded-xl"
              />
              <Link href="/mens">
                <button className="absolute bottom-4 left-4 bg-yellow-400 p-1 rounded text-[13px] font-semibold flex flex-row gap-2 justify-center items-center">
                  <span className="text-lg">Men Funky Socks</span> <UpRightArrowIcon width={24} height={24} />
                </button>
              </Link>
            </div>

          </FadeIn>

        </div>
      </Container>
    </section>
  );
}
