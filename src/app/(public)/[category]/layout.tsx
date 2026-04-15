import Container from "@/component/ui/Container";

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Container>
        {children}
      </Container>
    </>
  );
}
