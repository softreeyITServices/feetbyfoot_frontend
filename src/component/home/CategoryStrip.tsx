import { categories } from "@/constants/categories";
import CategoryCard from "../ui/CategoryCard";
import Container from "../ui/Container";
import FadeIn from "../ui/FadeIn";


export default function CategoryStrip() {
  return (
    <section className="py-12">
      <Container>
        <div className="flex flex-col md:flex-row gap-6">

          {/* LEFT BIG IMAGE */}
          <FadeIn direction="left" className="flex-1">
            <div className="h-full">
              <CategoryCard {...categories.left} />
            </div>
          </FadeIn>

          {/* RIGHT SIDE 2x2 GRID */}
          <FadeIn direction="right" delay={100} className="flex-1 flex flex-col gap-6">
            <div className="flex gap-6">
              <CategoryCard {...categories.right[0]} />
              <CategoryCard {...categories.right[1]} />
            </div>

            <div className="flex gap-6">
              <CategoryCard {...categories.right[2]} />
              <CategoryCard {...categories.right[3]} />
            </div>
          </FadeIn>

        </div>
      </Container>
    </section>
  );
}
