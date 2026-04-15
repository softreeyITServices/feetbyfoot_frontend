import Container from "@/component/ui/Container";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Container>{children}</Container>
    </>
  );
}
