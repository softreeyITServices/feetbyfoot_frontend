"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";
import { useState } from "react";

const OrderFailurePage = () => {

  const [valid, setValid] = useState(true); // failure page doesn't need paid validation
  const [loading, setLoading] = useState(false);

  if (loading) return <p>Loading...</p>;

  if (!valid) return null;

  return (
    <>
      <div className="bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">

          {/* Failure Icon */}
          <div className="flex justify-center mb-6">
            <XCircle className="w-20 h-20 text-red-500" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Payment Failed ❌
          </h1>

          <p className="text-gray-600 mb-6">
            Unfortunately, your payment could not be processed.
            Please try again or choose a different payment method.
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <Link
              href="/cart"
              className="block w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Retry Payment
            </Link>

            <Link
              href="/"
              className="block w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-100 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderFailurePage;
