"use client";

import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { ShopIcon } from "@/icons/ShopIcon";
import { OrderIcon } from "@/icons/OrderIcon";
import { NoOrderIcon } from "@/icons/NoOrderIcon";

export default function OrdersPage() {
  const router = useRouter();

  return (
    <div className=" px-6 py-16">
      <div className="max-w-5xl mx-auto">

        {/* Page Header */}
        <div className="mb-16">
          <h1 className="text-xl font-semibold text-gray-900">
            My Orders
          </h1>
          <p className="text-gray-500 mt-2 text-md">
            View and manage your past orders.
          </p>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center text-center">

          {/* Icon Circle */}
          <div className="w-24 h-24 flex items-center justify-center rounded-full bg-gray-100 mb-8">
            <NoOrderIcon width={30} height={40} />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            No orders found
          </h2>

          {/* Description */}
          <p className="text-gray-500 max-w-md mb-8">
            It looks like you haven&apos;t made any orders yet.
            When you do, they will appear here.
          </p>

          {/* Button */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-6 py-3 rounded-md shadow-sm transition-all duration-200"
          >
            {/* Small cart icon */}
            <ShopIcon width={18} height={18}/>
            Browse products
          </button>
        </div>

      </div>
    </div>
  );
}
