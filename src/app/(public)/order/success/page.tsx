"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { httpClient } from "@/lib/httpClient";

type Props = {
  searchParams: {
    orderId?: string;
  };
};

const OrderSuccessPage = ({ searchParams }: Props) => {
  const orderId = searchParams?.orderId;

  const [valid, setValid] = useState(true);
  const [loading, setLoading] = useState(false);

  // TODO: Need to be fixed once order id will be coming from BE endpoint

  // useEffect(() => {
  //   const validateOrder = async () => {
  //     if (!orderId) {
  //       router.replace("/");
  //       return;
  //     }

  //     try {
  //       const res = await httpClient.request({
  //         url: `/orders/${orderId}`,
  //         method: "GET",
  //         requiresAuth: true,
  //       });

  //       if (res.status === "PAID") {
  //         setValid(true);
  //       } else {
  //         router.replace("/");
  //       }
  //     } catch {
  //       router.replace("/");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   validateOrder();
  // }, [orderId]);

  if (loading) return <p>Loading...</p>;

  if (!valid) return null;

  return (
    <>
      <div className="bg-gray-50 flex items-center justify-center px-4 py-6">
        <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">

          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Order Placed Successfully 🎉
          </h1>

          <p className="text-gray-600 mb-6">
            Thank you for shopping with FeetByFoot.
            Your order has been confirmed.
          </p>

          {/* Order ID */}
          {orderId && (
            <div className="bg-gray-100 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-medium text-gray-800">{orderId}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            <Link
              href="/account/orders"
              className="block w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
            >
              View My Orders
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
}

export default OrderSuccessPage