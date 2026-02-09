
"use client";
import Navbar from "@/component/common/navbar";
import Footer from "@/component/common/Footer";
import BestSelling from "@/component/home/BestSelling";
import CategoryStrip from "@/component/home/CategoryStrip";
import HelpCTA from "@/component/home/HelpCTA";
import HeroBanner from "@/component/home/HeroBanner";
import PromoSection from "@/component/home/PromoSection";
import ShopByCategory from "@/component/home/ShopByCategory";
import TrendingGallery from "@/component/home/TrendingGallery";
import { SimpleMarquee } from "@/component/ui/Marquee";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HeroBanner />
      <SimpleMarquee text="Sale is live upto 60% off shop now free shiping | &nbsp;"/>
      <CategoryStrip />
      <BestSelling />
      <PromoSection />
      <ShopByCategory />
      <HelpCTA />
      <TrendingGallery />
      <Footer />
    </>
  );
}
