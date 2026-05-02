"use client";

import Image from "next/image";
import Link from "next/link";
import Container from "../ui/Container";
import FadeIn from "../ui/FadeIn";

export default function PromoCarousel() {
  return (
    <Container>
      <section className="w-full overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

          {/* ================= LEFT BANNER ================= */}
          <FadeIn direction="left" className="relative h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden group">
            <Image
              src="/assets/images/womens-winter-socks.jpg"
              alt="Women's Winter Socks"
              fill
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 50vw"
            />

            {/* Dark overlay for better text readability on mobile */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent sm:from-black/10 sm:via-transparent" />

            {/* Text Overlay */}
            <div className="absolute inset-0 flex flex-col justify-center px-5 sm:px-8 md:px-14">
              <span className="text-xs sm:text-lg md:text-2xl tracking-[0.15em] sm:tracking-widest uppercase mb-2 sm:mb-3 md:mb-4 text-[#00C484] font-semibold">
                New Arrivals
              </span>

              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight mb-8 sm:mb-16 md:mb-20 text-white sm:text-[#1b5e3c] drop-shadow-lg sm:drop-shadow-none">
                Women&apos;s Winter <br /> Socks
              </h2>

              <Link
                href="/shop?isNewArrival=true"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold underline underline-offset-4 w-fit text-white sm:text-[#1b5e3c] hover:text-[#00C484] transition-colors"
              >
                Shop Now ↗
              </Link>

              <span className="text-lg sm:text-2xl md:text-[65px] mt-3 sm:mt-4 md:mt-0 text-white/90 sm:text-[#1b5e3c]/70 font-bold tracking-wide">
                COLLECTION
              </span>
            </div>
          </FadeIn>

          {/* ================= RIGHT BANNER ================= */}
          <FadeIn direction="right" delay={150} className="relative h-[300px] sm:h-[400px] md:h-[500px] bg-[#f8f8f8] md:bg-white overflow-hidden group">
            <Image
              src="/assets/images/socks-sale.jpg"
              alt="Socks Sale"
              fill
              priority
              className="object-cover sm:object-contain transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 50vw"
            />

            {/* Light overlay for text readability */}
            <div className="absolute inset-0 bg-white/20 sm:bg-transparent" />

            {/* Text Overlay */}
            <div className="absolute inset-0 flex">
              {/* Vertical SOCKS text */}
              <div className="hidden lg:flex items-center absolute left-0 top-0 bottom-0">
                <span className="text-4xl lg:text-5xl rotate-[-270deg] tracking-[0.3em] lg:tracking-[0.4em] opacity-40 lg:opacity-60 font-sans origin-center whitespace-nowrap text-gray-400">
                  SOCKS
                </span>
              </div>
              
              <div className="flex flex-col justify-center px-5 sm:px-10 md:px-14 lg:px-20 w-full">
                <span className="text-[10px] sm:text-xs md:text-sm tracking-[0.15em] sm:tracking-widest uppercase mb-2 sm:mb-3 md:mb-4 font-semibold text-gray-600">
                  2026 Season Sale
                </span>

                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight mb-6 sm:mb-8 md:mb-10 text-[#1b5e3c]">
                  Up To <br />
                  <span className="text-[#00C484] font-extrabold">
                    70% Off
                  </span>
                </h2>

                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold underline underline-offset-4 w-fit text-[#1b5e3c] hover:text-[#00C484] transition-colors"
                >
                  Shop Now ↗
                </Link>

                {/* Mobile SOCKS text */}
                <span className="lg:hidden text-sm tracking-[0.3em] opacity-30 font-sans mt-4 text-gray-400">
                  SOCKS
                </span>
              </div>
            </div>
          </FadeIn>

        </div>
      </section>
    </Container>
  );
}