import { ProductsGridSkeleton } from "@/component/ui/ProductCardSkeleton";

export default function ShopLoading() {
  return (
    <main className="w-full">
      {/* Heading */}
      <div className="text-center mt-10">
        <div className="inline-block bg-gray-200 animate-pulse h-12 w-44 rounded" />
        <div className="mt-2 bg-gray-200 animate-pulse h-4 w-64 mx-auto rounded" />
      </div>

      {/* Banner */}
      <section className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-gray-200 animate-pulse w-full h-48 rounded-xl" />
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar skeleton */}
          <aside className="hidden lg:flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse h-8 rounded" />
            ))}
          </aside>

          {/* Products skeleton */}
          <div id="products-section">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="bg-gray-200 animate-pulse h-4 w-52 rounded" />
              <div className="bg-gray-200 animate-pulse h-9 w-32 rounded" />
            </div>

            <ProductsGridSkeleton count={6} />

            {/* Pagination skeleton */}
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse h-10 w-10 rounded" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
