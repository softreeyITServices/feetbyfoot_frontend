// loading.tsx
export default function LoadingProduct() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
      {/* Top section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery skeleton */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-20 h-20 bg-gray-200 rounded-md"
              />
            ))}
          </div>
          <div className="flex-1 h-[420px] bg-gray-200 rounded-lg" />
        </div>

        {/* Product info skeleton */}
        <div>
          <div className="h-6 w-3/4 bg-gray-200 rounded mb-4" />
          <div className="h-5 w-40 bg-gray-200 rounded mb-6" />

          <div className="h-4 w-full bg-gray-200 rounded mb-6" />

          <div className="flex gap-3 mb-6">
            <div className="h-10 w-40 bg-gray-200 rounded" />
            <div className="h-10 w-40 bg-gray-200 rounded" />
          </div>

          <div className="flex gap-4 mb-8">
            <div className="h-12 w-32 bg-gray-200 rounded" />
            <div className="h-12 flex-1 bg-gray-200 rounded" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-4 bg-gray-200 rounded"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="mt-16">
        <div className="flex gap-8 mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-4 w-24 bg-gray-200 rounded"
            />
          ))}
        </div>

        <div className="bg-gray-200 rounded-lg h-56" />
      </div>
    </main>
  );
}
