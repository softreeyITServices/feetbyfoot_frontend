import { categories } from "@/constants/categories";
import CategoryCard from "../ui/CategoryCard";
import FadeIn from "../ui/FadeIn";

export default function CategoryStrip() {
  return (
    <section className="py-6 sm:py-8 md:py-10 overflow-hidden w-full">
      <div className="w-full px-1 sm:px-2">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-5">

          {/* LEFT BIG IMAGE */}
          <FadeIn direction="left" className="w-full md:flex-1">
            <div className="h-[250px] sm:h-[350px] md:h-full min-h-[300px] sm:min-h-[400px] md:min-h-0">
              <CategoryCard {...categories.left} />
            </div>
          </FadeIn>

          {/* RIGHT SIDE 2x2 GRID */}
          <FadeIn direction="right" delay={100} className="w-full md:flex-1">
            <div className="flex flex-col gap-3 sm:gap-4 md:gap-5">
              {/* First Row */}
              <div className="flex gap-3 sm:gap-4 md:gap-5">
                <CategoryCard {...categories.right[0]} />
                <CategoryCard {...categories.right[1]} />
              </div>

              {/* Second Row */}
              <div className="flex gap-3 sm:gap-4 md:gap-5">
                <CategoryCard {...categories.right[2]} />
                <CategoryCard {...categories.right[3]} />
              </div>
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}