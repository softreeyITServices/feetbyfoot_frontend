import Image from "next/image";
import Container from "../ui/Container";
import { UpRightArrowIcon } from "@/icons/UpRightArrowIcon";
import Link from "next/link";
import FadeIn from "../ui/FadeIn";

export default function ShopByCategory() {
  return (
    <section className="py-8 sm:py-12 md:py-16 overflow-hidden">
      <Container>
        {/* Title */}
        <FadeIn direction="up" className="mb-6 sm:mb-8 lg:hidden text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-green-900 leading-tight">
            Shop By <br /> Category
          </h2>
        </FadeIn>

        {/* PARENT GRID - 2 cols mobile, 2 cols tablet, 3 cols desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          
          {/* COLUMN 1 - Title (desktop only) + Kids Socks */}
          <FadeIn direction="up" className="flex flex-col gap-4 sm:gap-6 md:gap-10">
            {/* Desktop Title */}
            <h2 className="hidden lg:block text-2xl xl:text-3xl 2xl:text-4xl font-semibold text-green-900 leading-tight">
              Shop By <br /> Category
            </h2>

            {/* Kids Socks */}
            <div className="relative rounded-xl overflow-hidden group">
              <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] min-h-[200px] sm:min-h-[250px]">
                <Image
                  src="/assets/images/masonary_img_1.png"
                  alt="Kids Socks"
                  fill
                  className="object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-24 bg-gradient-to-t from-black/30 to-transparent rounded-b-xl" />
              <Link href="/kids" className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-10">
                <button className="bg-yellow-400 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[11px] sm:text-sm font-semibold flex items-center gap-1 sm:gap-2 hover:bg-yellow-300 transition-colors shadow-lg">
                  <span className="sm:text-base md:text-lg line-clamp-1">Kids Socks</span>
                  <UpRightArrowIcon width={16} height={16} className="sm:w-[20px] sm:h-[20px] md:w-[24px] md:h-[24px] shrink-0" />
                </button>
              </Link>
            </div>
          </FadeIn>

          {/* COLUMN 2 - Gift Packs + Women Socks */}
          <FadeIn direction="up" delay={150} className="flex flex-col gap-3 sm:gap-4 md:gap-6">
            {/* Gift Packs */}
            <div className="relative rounded-xl overflow-hidden group">
              <div className="relative w-full aspect-square sm:aspect-[4/3] min-h-[200px] sm:min-h-[250px]">
                <Image
                  src="/assets/images/masonary_img_2.png"
                  alt="Socks Gift Packs"
                  fill
                  className="object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-24 bg-gradient-to-t from-black/30 to-transparent rounded-b-xl" />
              <Link href="/gifts" className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-10">
                <button className="bg-yellow-400 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[11px] sm:text-sm font-semibold flex items-center gap-1 sm:gap-2 hover:bg-yellow-300 transition-colors shadow-lg">
                  <span className="sm:text-base md:text-lg line-clamp-1">Socks Gift Packs</span>
                  <UpRightArrowIcon width={16} height={16} className="sm:w-[20px] sm:h-[20px] md:w-[24px] md:h-[24px] shrink-0" />
                </button>
              </Link>
            </div>

            {/* Women Floral Socks */}
            <div className="relative rounded-xl overflow-hidden group flex-1">
              <div className="relative w-full h-full aspect-[3/4] sm:aspect-[4/5] min-h-[250px] sm:min-h-[300px]">
                <Image
                  src="/assets/images/masonary_img_3.png"
                  alt="Women Food & Florals Socks"
                  fill
                  className="object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-24 bg-gradient-to-t from-black/30 to-transparent rounded-b-xl" />
              <Link href="/womens" className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-10">
                <button className="bg-yellow-400 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[11px] sm:text-sm font-semibold flex items-center gap-1 sm:gap-2 hover:bg-yellow-300 transition-colors shadow-lg max-w-[180px] sm:max-w-[250px] md:max-w-none">
                  <span className="sm:text-base md:text-lg line-clamp-1">Women Food Socks</span>
                  <UpRightArrowIcon width={16} height={16} className="sm:w-[20px] sm:h-[20px] md:w-[24px] md:h-[24px] shrink-0" />
                </button>
              </Link>
            </div>
          </FadeIn>

          {/* COLUMN 3 - Men Socks (spans full width on mobile) */}
          <FadeIn direction="up" delay={300} className="col-span-2 lg:col-span-1 lg:mt-20">
            <div className="relative rounded-xl overflow-hidden group h-full">
              <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[3/4] min-h-[200px] sm:min-h-[250px] lg:min-h-0 lg:h-full">
                <Image
                  src="/assets/images/masonary_img_4.png"
                  alt="Men Funky Socks"
                  fill
                  className="object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-24 bg-gradient-to-t from-black/30 to-transparent rounded-b-xl" />
              <Link href="/mens" className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-10">
                <button className="bg-yellow-400 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[11px] sm:text-sm font-semibold flex items-center gap-1 sm:gap-2 hover:bg-yellow-300 transition-colors shadow-lg">
                  <span className="sm:text-base md:text-lg line-clamp-1">Men Funky Socks</span>
                  <UpRightArrowIcon width={16} height={16} className="sm:w-[20px] sm:h-[20px] md:w-[24px] md:h-[24px] shrink-0" />
                </button>
              </Link>
            </div>
          </FadeIn>

        </div>
      </Container>
    </section>
  );
}