
import BestSelling from "@/component/home/BestSelling";
import CategoryStrip from "@/component/home/CategoryStrip";
import HelpCTA from "@/component/home/HelpCTA";
import HeroBanner from "@/component/home/HeroBanner";
import PromoSection from "@/component/home/PromoSection";
import ShopByCategory from "@/component/home/ShopByCategory";
import TrendingGallery from "@/component/home/TrendingGallery";
import { Marquee } from "@/component/ui/Marquee";
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <Marquee />
      <CategoryStrip />
      <BestSelling />
      <PromoSection />
      <ShopByCategory />
      <HelpCTA />
      <TrendingGallery />
    </>
  );
}
