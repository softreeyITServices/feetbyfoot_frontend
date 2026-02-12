"use client";

import Navbar from "@/component/common/navbar";
import Footer from "@/component/common/Footer";
import Image from "next/image";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  removeFromCart,
  updateQuantity,
} from "@/store/slices/cart.slice";
import { startRazorpayCheckout } from "@/lib/payments/razorpay/razorpay.client";

export default function CartBody() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(state => state.cart.items);

  const [shipping, setShipping] = useState<"free" | "flat">("free");

  const getPrice = (price: string | number): number => {
    if (typeof price === "number") return price;
    const parsed = Number(price);
    return isNaN(parsed) ? 0 : parsed;
  };

  const subtotal = items.reduce(
    (sum, item) => sum + getPrice(item.price) * item.quantity,
    0
  );

  const shippingCost = shipping === "free" ? 0 : 51.45;
  const total = subtotal + shippingCost;

  const handleIncrease = (
    id: string,
    size: string,
    quantity: number
  ) => {
    dispatch(updateQuantity({ id, size, quantity: quantity + 1 }));
  };

  const handleDecrease = (
    id: string,
    size: string,
    quantity: number
  ) => {
    if (quantity > 1) {
      dispatch(updateQuantity({ id, size, quantity: quantity - 1 }));
    }
  };

  const handleRemove = (id: string, size: string) => {
    dispatch(removeFromCart({ id, size }));
  };

  const handlePayment = async () => {
    await startRazorpayCheckout({
      amount: subtotal,
      onSuccess: () => {
        alert("Payment Successful!");
      },
      onFailure: () => {
        alert("Payment Failed");
      },
    });
  };

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-14">
        <h1 className="text-3xl font-semibold mb-10">Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] text-xs text-gray-500 uppercase border-b pb-3 border-gray-300">
              <div>Product</div>
              <div className="text-center">Price</div>
              <div className="text-center">Quantity</div>
              <div className="text-right">Subtotal</div>
            </div>

            {items.length === 0 && (
              <p className="py-6 text-gray-500">Your cart is empty</p>
            )}

            {items.map(item => (
              <div
                key={`${item.id}-${item.size}`}
                className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center py-6 border-b border-gray-300"
              >
                {/* Product */}
                <div className="flex gap-4">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded"
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Size: {item.size}
                    </p>
                    <button
                      onClick={() =>
                        handleRemove(item.id, item.size)
                      }
                      className="text-red-500 text-sm mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="text-center">
                  ₹{getPrice(item.price).toFixed(2)}
                </div>

                {/* Quantity */}
                <div className="flex justify-center">
                  <div className="flex border border-gray-300 rounded">
                    <button
                      className="px-3 py-1"
                      onClick={() =>
                        handleDecrease(
                          item.id,
                          item.size,
                          item.quantity
                        )
                      }
                    >
                      −
                    </button>
                    <span className="px-4 py-1 border-x border-gray-300">
                      {item.quantity}
                    </span>
                    <button
                      className="px-3 py-1"
                      onClick={() =>
                        handleIncrease(
                          item.id,
                          item.size,
                          item.quantity
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="text-right font-medium">
                  ₹
                  {(
                    getPrice(item.price) *
                    item.quantity
                  ).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE */}
          <div className="bg-gray-50 p-6 rounded-lg h-fit">
            <h2 className="text-lg font-semibold mb-3">
              Basket Totals
            </h2>

            <div className="flex justify-between text-sm mb-4 border-t pt-6 border-gray-300">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            {/* Shipping */}
            <div className="border-t pt-4 border-gray-300">
              <p className="text-sm font-medium mb-3">Shipping</p>

              <label className="flex items-center gap-2 text-sm mb-2">
                <input
                  type="radio"
                  checked={shipping === "free"}
                  onChange={() => setShipping("free")}
                />
                Free shipping
                <span className="ml-auto">₹0.00</span>
              </label>

              <label className="flex items-center gap-2 text-sm mb-2">
                <input
                  type="radio"
                  checked={shipping === "flat"}
                  onChange={() => setShipping("flat")}
                />
                Flat rate
                <span className="ml-auto">₹51.45</span>
              </label>
            </div>

            {/* Total */}
            <div className="border-t mt-6 pt-4 flex justify-between items-center border-gray-300">
              <p className="font-semibold">Total</p>
              <p className="text-xl font-semibold">
                ₹{total.toFixed(2)}
              </p>
            </div>

            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded mt-6 font-medium" onClick={handlePayment}>
              Place Order
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
