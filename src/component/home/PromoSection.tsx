"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

// import "swiper/css";
// import "swiper/css/pagination";
import Container from "../ui/Container";

const slides = [
  "/assets/images/promo-winter.png",
  "/assets/images/promo-winter.png",
  "/assets/images/promo-winter.png"
];

export default function PromoCarousel() {
  return (
    <Container>
      <section className="w-full">
        {/* <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000 }}
          loop
          className="w-full"
        >
          {slides.map((src, index) => (
            <SwiperSlide key={index}>
              <div className="w-full">
                <Image
                  src={src}
                  alt={`Promo Slide ${index + 1}`}
                  width={1800}
                  height={700}
                  className="w-full h-auto object-cover"
                  priority={index === 0}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper> */}


        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* ================= LEFT BANNER ================= */}
          <div className="relative h-90 md:h-130">
            <Image
              src="/assets/images/womens-winter-socks.jpg"
              alt="Women's Winter Socks"
              fill
              priority
              className="object-cover"
            />

            {/* Text Overlay */}
            <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-14 text-[#1b5e3c]">
              <span className="text-2xl tracking-widest uppercase mb-4 text-[#00C484]">
                New Arrivals
              </span>

              <h2 className="text-3xl md:text-5xl font-normal leading-tight mb-20">
                Women’s Winter <br /> Socks
              </h2>

              <a
                href="#"
                className="inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4 w-fit"
              >
                Shop Now ↗
              </a>

              <span className="collection-outline text-[55px] md:text-[65px]">
                COLLECTION
              </span>
            </div>
          </div>

          {/* ================= RIGHT BANNER ================= */}
          <div className="relative h-90 md:h-130 bg-white">
            <Image
              src="/assets/images/socks-sale.jpg"
              alt="Socks Sale"
              fill
              priority
              className="object-contain"
            />

            {/* Text Overlay */}
            <div className="flex flex-row absolute inset-0 -ml-10">
              <span className="collection-outline text-5xl absolute top-1/2 -translate-y-1/2 rotate-[-270deg] tracking-[0.4em] opacity-60">
                SOCKS
              </span>
              <div className="flex flex-col absolute inset-0 justify-center px-30 md:px-40 text-[#1b5e3c]">
                <span className="text-sm tracking-widest uppercase mb-4">
                  2026 Season Sale
                </span>

                <h2 className="text-4xl md:text-5xl font-normal leading-tight mb-10">
                  Up To <br />
                  <span className="font-normal">70% Off</span>
                </h2>

                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4 w-fit"
                >
                  Shop Now ↗
                </a>
              </div>
              {/* Vertical SOCKS text */}

            </div>
          </div>

        </div>
      </section>
    </Container>
  );
}
