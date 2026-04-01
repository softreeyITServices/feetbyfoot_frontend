"use client";

import { useEffect, useState } from "react";
import BannerSlider, { Slide } from "../ui/BannerSlider";
import Container from "../ui/Container";
import { bannerService } from "@/domain/application/services/banner.service";

export default function HeroBanner() {
  const [slides, setSlides] = useState<Slide[]>([]);

  useEffect(() => {
    bannerService
      .getActiveBanners()
      .then((banners) => {
        if (!banners?.length) return;
        setSlides(
          banners.map((banner, index) => ({
            id: index + 1,
            image: banner.imageUrl,
            title: banner.title,
          }))
        );
      })
      .catch(() => {
        // Silently ignore — backend may be down or returning 404
      });
  }, []);

  if (!slides.length) return null;

  return (
    <section className="section">
      <Container>
        <BannerSlider slides={slides} />
      </Container>
    </section>
  );
}
