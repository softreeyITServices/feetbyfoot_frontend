"use client";

import { useEffect, useState } from "react";
import BannerSlider, { Slide } from "../ui/BannerSlider";
import { bannerService } from "@/domain/application/services/banner.service";

export default function HeroBanner() {
  const [slides, setSlides] = useState<Slide[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const banners = await bannerService.getActiveBanners();
        if (!banners?.length) return;
        setSlides(
          banners.map((banner, index) => ({
            id: index + 1,
            image: banner.imageUrl,
            title: banner.title,
            subtitle: banner.subtitle,
            ctaText: banner.ctaText ?? "Shop Now",
            ctaLink: banner.redirectUrl ?? "/shop",
          }))
        );
      } catch {
        // Silently ignore — backend may be down or returning 404
      }
    };

    fetchBanners();
  }, []);

  if (!slides.length) return null;

  return (
    <section className="w-full">
      <BannerSlider slides={slides} sideBanner={{ label: "LOTTERY DISCOUNT", href: "/collections/sale" }} />
    </section>
  );
}
