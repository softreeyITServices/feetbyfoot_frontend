"use client";

import { useEffect, useState } from "react";
import BannerSlider, { Slide } from "../ui/BannerSlider";
import Container from "../ui/Container";
import { bannerService } from "@/domain/application/services/banner.service";

export default function HeroBanner() {
  const [slides, setSlides] = useState<Slide[]>([]);

  console.log("slides", slides);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const banners = await bannerService.getActiveBanners();
        console.log("banners", banners);
        
        if (!banners?.length) return;
        setSlides(
          banners.map((banner, index) => ({
            id: index + 1,
            image: banner.imageUrl,
            title: banner.title,
          }))
        );
      } catch (error) {
        // Silently ignore — backend may be down or returning 404
      }
    };

    fetchBanners();
  }, []);

  if (!slides.length) return null;

  return (
    <section className="w-full py-4 sm:py-6">
      <Container>
        <BannerSlider slides={slides} />
      </Container>
    </section>
  );
}
