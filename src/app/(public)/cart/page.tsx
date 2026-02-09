
"use client"
import Navbar from "@/component/common/navbar";
import Footer from "@/component/common/Footer";
import Image from "next/image";
import { useState } from "react";


export default function CartBody() {

  const [shipping, setShipping] = useState<"free" | "flat">("free");

  // const shippingCost = shipping === "free" ? 0 : 51.45;
  // const subtotal = 299;
  // const total = subtotal + shippingCost;

  const handleShipping = (value: "free" | "flat") => {
    setShipping(value);
  };
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-14">
        {/* Page Title */}
        <h1 className="text-3xl font-semibold mb-10">Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* LEFT: Cart Table */}
          <div className="lg:col-span-2">
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] text-xs text-gray-500 uppercase border-b pb-3 border-gray-300">
              <div>Product</div>
              <div className="text-center">Price</div>
              <div className="text-center">Quantity</div>
              <div className="text-right">Subtotal</div>
            </div>

            {/* Cart Item */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center py-6 border-b border-gray-300">
              {/* Product */}
              <div className="flex gap-4">
                <Image
                  src="/assets/images/product-1.png"
                  alt="Kids Christmas Socks Gift Box"
                  width={80}
                  height={80}
                  className="rounded"
                />
                <div>
                  <p className="font-medium">Kids Christmas Socks Gift Box</p>
                  <p className="text-sm text-gray-500">
                    3 Pairs Festive Holiday Collection
                  </p>
                  <button className="text-red-500 text-sm mt-1">Remove</button>
                </div>
              </div>

              {/* Price */}
              <div className="text-center">₹299.00</div>

              {/* Quantity */}
              <div className="flex justify-center">
                <div className="flex border border-gray-300 rounded">
                  <button className="px-3 py-1">−</button>
                  <span className="px-4 py-1 border-x border-gray-300">1</span>
                  <button className="px-3 py-1">+</button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="text-right font-medium">₹299.00</div>
            </div>

            {/* Coupon */}
            <div className="flex gap-4 mt-6">
              <input
                type="text"
                placeholder="Coupon code"
                className="flex-1 border border-gray-300 px-4 py-3 rounded text-sm"
              />
              <button className="bg-black text-white px-6 py-3 text-sm">
                Update Basket
              </button>
            </div>
          </div>

          {/* RIGHT: Basket Totals */}
          <div className="bg-gray-50 p-6 rounded-lg h-fit">
            <h2 className="text-lg font-semibold mb-3">Basket Totals</h2>

            <div className="flex justify-between text-sm mb-4 border-t pt-6 border-gray-300">
              <span>Subtotal</span>
              <span>₹299.00</span>
            </div>

            <div className="border-t pt-4 border-gray-300">
              <p className="text-sm font-medium mb-3">Shipping</p>

              <label className="flex items-center gap-2 text-sm mb-2">
                <input
                  type="radio"
                  name="shipping"
                  checked={shipping === "free"}
                  onChange={() => handleShipping("free")}
                />
                Free shipping
                <span className="ml-auto">₹0.00</span>
              </label>

              <label className="flex items-center gap-2 text-sm mb-2">
                <input
                  type="radio"
                  name="shipping"
                  checked={shipping === "flat"}
                  onChange={() => handleShipping("flat")}
                />
                Flat rate
                <span className="ml-auto">₹51.45</span>
              </label>


              <p className="text-xs text-gray-500 mt-3">
                Shipping to <span className="font-medium">Haryana</span>.
              </p>
              <button className="text-green-600 text-sm mt-1">
                Change address
              </button>
            </div>

            <div className="border-t mt-6 pt-4 flex justify-between items-center border-gray-300">
              <div>
                <p className="font-semibold">Total</p>
                <p className="text-xs text-gray-500">
                  (includes ₹14.24 GST)
                </p>
              </div>
              <p className="text-xl font-semibold">₹299.00</p>
            </div>

            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded mt-6 font-medium">
              Place Order
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
