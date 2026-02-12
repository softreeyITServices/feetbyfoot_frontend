// not-found.tsx
export default function ProductNotFound() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-semibold mb-4">
        Product not found
      </h2>
      <p className="text-gray-600 mb-6">
        This product may have been removed or doesn’t exist.
      </p>
      <a
        href="/shop"
        className="bg-black text-white px-6 py-3 rounded-md"
      >
        Continue Shopping
      </a>
    </main>
  );
}
