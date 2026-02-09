import Image from "next/image";
import Container from "../ui/Container";

export default function HeroBanner() {
  return (
    <section className="section">
      <Container>
      <Image
        src="/assets/images/hero-christmas-sale.png"
        alt="Christmas Sale"
        width={1920}
        height={650}
        priority
      />
      </Container>
    </section>
  );
}
