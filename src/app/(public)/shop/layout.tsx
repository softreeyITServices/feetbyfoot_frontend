import Navbar from "@/component/common/navbar";
import Footer from "@/component/common/Footer";
import Container from "@/component/ui/Container";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <Container>{children}</Container>
      <Footer />
    </>
  );
}
