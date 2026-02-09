import { categories } from "@/constants/categories";
import CategoryCard from "../ui/CategoryCard";
import Container from "../ui/Container";


export default function CategoryStrip() {
  return (
    <section className="py-12">
      <Container>
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* LEFT BIG IMAGE */}
          <div className="flex-1">
            <div className="h-full">
              <CategoryCard {...categories.left} />
            </div>
          </div>

          {/* RIGHT SIDE 2x2 GRID */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex gap-6">
              <CategoryCard {...categories.right[0]} />
              <CategoryCard {...categories.right[1]} />
            </div>

            <div className="flex gap-6">
              <CategoryCard {...categories.right[2]} />
              <CategoryCard {...categories.right[3]} />
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
