import { categories } from "@/constants/categories";
import CategoryCard from "../ui/CategoryCard";
import Container from "../ui/Container";
import FadeIn from "../ui/FadeIn";

export default function CategoryStrip() {
  return (
    <section className="py-8 sm:py-10 md:py-12 overflow-hidden">
      <Container>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-5 md:gap-6">

          {/* LEFT BIG IMAGE */}
          <FadeIn direction="left" className="w-full md:flex-1">
            <div className="h-[250px] sm:h-[350px] md:h-full min-h-[300px] sm:min-h-[400px] md:min-h-0">
              <CategoryCard {...categories.left} />
            </div>
          </FadeIn>

          {/* RIGHT SIDE 2x2 GRID */}
          <FadeIn direction="right" delay={100} className="w-full md:flex-1">
            <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
              {/* First Row */}
              <div className="flex gap-4 sm:gap-5 md:gap-6">
                <CategoryCard {...categories.right[0]} />
                <CategoryCard {...categories.right[1]} />
              </div>

              {/* Second Row */}
              <div className="flex gap-4 sm:gap-5 md:gap-6">
                <CategoryCard {...categories.right[2]} />
                <CategoryCard {...categories.right[3]} />
              </div>
            </div>
          </FadeIn>

        </div>
      </Container>
    </section>
  );
}