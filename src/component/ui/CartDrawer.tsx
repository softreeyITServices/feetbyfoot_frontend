"use client";

import Image from "next/image";
import { X, Trash2 } from "lucide-react";
import { CartBasketIcon } from "@/icons/CartBasketIcon";

type CartItem = {
  id: number;
  name: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
};

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
}: CartDrawerProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    // Implement checkout logic here
    alert("Proceeding to checkout!");
  }

  const handleCart = () => {
    window.location.href = "/cart";
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-105 bg-white z-50
        transform transition-transform duration-300 cart-drawer
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2 font-medium">
            <CartBasketIcon width={20} height={20} fill="#000"/>
            <span>{items.length} items in cart</span>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <Image
                src={item.image}
                alt={item.name}
                width={80}
                height={80}
                className="rounded-md border"
              />

              <div className="flex-1">
                <p className="text-sm font-medium leading-snug">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Size: {item.size}
                </p>

                <div className="flex items-center justify-between mt-3">
                  {/* Quantity */}
                  <div className="flex items-center border rounded">
                    <button className="px-2 py-1 text-sm">−</button>
                    <span className="px-3 text-sm">
                      {item.quantity}
                    </span>
                    <button className="px-2 py-1 text-sm">+</button>
                  </div>

                  <p className="text-sm font-medium">
                    ₹{item.price.toFixed(2)}
                  </p>
                </div>
              </div>

              <button className="text-red-500 mt-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Your savings on this order are:
            </span>
            <span className="font-medium">₹200.00</span>
          </div>

          <div className="flex justify-between text-base font-semibold">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          <div className="space-y-2 pt-2">
            <button className="w-full bg-black text-white py-3 text-sm rounded" onClick={handleCart}>
              View Cart
            </button>
            <button className="w-full bg-black text-white py-3 text-sm rounded" onClick={onClose}>
              Continue Shopping
            </button>
            <button className="w-full bg-black text-white py-3 text-sm rounded" onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
