// error.tsx
"use client";

export default function ProductError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-semibold mb-4">
        Something went wrong 😕
      </h2>

      <p className="text-gray-600 mb-8">
        We couldn’t load this product right now. Please try again.
      </p>

      <div className="flex justify-center gap-4">
        <button
          onClick={reset}
          className="bg-black text-white px-6 py-3 rounded-md"
        >
          Retry
        </button>

        <a
          href="/shop"
          className="border px-6 py-3 rounded-md"
        >
          Back to Shop
        </a>
      </div>
    </main>
  );
}
