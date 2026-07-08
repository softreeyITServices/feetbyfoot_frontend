import { cache } from "react";
import Link from "next/link";
import { popularSearchService } from "@/domain/application/services/popularSearch.service";
import Container from "../ui/Container";
import FadeIn from "../ui/FadeIn";

const getPopularSearches = cache(async () => {
  return popularSearchService.getPopularSearches();
});

export default async function PopularSearches() {
  let items: Awaited<ReturnType<typeof getPopularSearches>> = [];
  try {
    items = await getPopularSearches();
  } catch {
    return null;
  }

  if (!items.length) return null;

  return (
    <Container>
      <section className="flex flex-col gap-6 py-8 sm:py-10 md:py-12">
        <FadeIn direction="up" className="text-center border-b border-gray-200 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-wide text-gray-700 uppercase">
            Popular Searches
          </h2>
        </FadeIn>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {items.map((item, index) => (
            <FadeIn key={item.id} direction="up" delay={index * 50}>
              <Link href={item.href} className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3 hover:border-gray-400 hover:shadow-sm transition-all duration-150">
                <span className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </span>
                <span className="text-sm text-gray-600 leading-tight">{item.label}</span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>
    </Container>
  );
}
