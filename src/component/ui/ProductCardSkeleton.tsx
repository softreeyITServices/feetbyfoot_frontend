export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-gray-200 animate-pulse aspect-square rounded-xl w-full" />
      <div className="bg-gray-200 animate-pulse h-3 w-1/3 rounded" />
      <div className="bg-gray-200 animate-pulse h-4 w-3/4 rounded" />
      <div className="flex gap-2 mt-1">
        <div className="bg-gray-200 animate-pulse h-4 w-16 rounded" />
        <div className="bg-gray-200 animate-pulse h-4 w-12 rounded" />
      </div>
    </div>
  );
}

export function ProductsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
