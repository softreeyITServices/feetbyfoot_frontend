import Navbar from "../common/navbar";
import Footer from "../common/Footer";
import SectionTitle from "../ui/SectionTitle";

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, children }: Props) {
  return (
    <>
      <Navbar />
      <SectionTitle title={title} />
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16">
        {children}
      </div>
      <Footer />
    </>
  );
}
