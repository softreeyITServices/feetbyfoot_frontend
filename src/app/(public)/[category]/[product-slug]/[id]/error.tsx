"use client";

import { useRouter } from "next/navigation";

export default function ProductError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  const handleRetry = () => {
    // Hard reload
    window.location.reload();
  };

  const handleBack = () => {
    router.back(); // history back
  };

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
          onClick={handleRetry}
          className="bg-black text-white px-6 py-3 rounded-md"
        >
          Retry
        </button>

        <button
          onClick={handleBack}
          className="border px-6 py-3 rounded-md"
        >
          Back
        </button>
      </div>
    </main>
  );
}