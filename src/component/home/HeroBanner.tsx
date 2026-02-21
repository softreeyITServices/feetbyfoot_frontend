import BannerSlider, { Slide } from "../ui/BannerSlider";
import Container from "../ui/Container";
import { bannerService } from "@/domain/application/services/banner.service";

export default async function HeroBanner() {
  const activeBanners = await bannerService.getActiveBanners();

  const slides: Slide[] = activeBanners.map((banner, index) => ({
    id: index + 1,
    image: banner.imageUrl,
    title: banner.title,
  }));

  return (
    <section className="section">
      <Container>
        <BannerSlider slides={slides} />
      </Container>
    </section>
  );
}
