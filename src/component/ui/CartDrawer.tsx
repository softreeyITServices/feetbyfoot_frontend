"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Trash2 } from "lucide-react";
import { CartBasketIcon } from "@/icons/CartBasketIcon";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  removeFromCart,
  setCart,
  updateQuantity,
} from "@/store/slices/cart.slice";
import { useRouter } from 'next/navigation'
import {
  handleIncreaseCart,
  handleDecreaseCart,
  handleRemoveCart,
} from "@/lib/cartHandler";
import { useSession } from "next-auth/react";
import { cartService } from "@/domain/application/services/cart.service";
import { mapCartApiResponseToRedux } from "@/domain/shared/mappers/cartMapper";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
}: CartDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const dispatch = useAppDispatch();
  const items = useAppSelector(state => state.cart.items);
  const Router = useRouter()
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getPrice = (price: string | number): number => {
    if (typeof price === "number") return price;
    const parsed = Number(price);
    return isNaN(parsed) ? 0 : parsed;
  };

  const subtotal = items.reduce(
    (sum, item) =>
      sum + getPrice(item.price) * item.quantity,
    0
  );

  const handleIncrease = async (
    id: string,
    size: string,
    quantity: number,
    itemId?: string
  ) => {
    await handleIncreaseCart({
      id,
      size,
      quantity,
      itemId,
      isAuthenticated: !!session,
      onLocalUpdate: () =>
        dispatch(updateQuantity({ id, size, quantity: quantity + 1 })),
      refreshBackend: async () => {
        const dbCart = await cartService.getCart();
        dispatch(setCart(mapCartApiResponseToRedux(dbCart)));
      },
    });
  };

  const handleDecrease = async (
    id: string,
    size: string,
    quantity: number,
    itemId?: string
  ) => {
    await handleDecreaseCart({
      id,
      size,
      quantity,
      itemId,
      isAuthenticated: !!session,
      onLocalUpdate: () =>
        dispatch(updateQuantity({ id, size, quantity: quantity - 1 })),
      refreshBackend: async () => {
        const dbCart = await cartService.getCart();
        dispatch(setCart(mapCartApiResponseToRedux(dbCart)));

      },
    });
  };

  const handleRemove = async (
    id: string,
    size: string,
    itemId?: string
  ) => {
    await handleRemoveCart({
      id,
      size,
      itemId,
      isAuthenticated: !!session,
      onLocalUpdate: () =>
        dispatch(removeFromCart({ id, size })),
      refreshBackend: async () => {
        const dbCart = await cartService.getCart();
        dispatch(setCart(mapCartApiResponseToRedux(dbCart)));
      },
    });
  };


  const handleCart = () => {
    onClose()
    Router.push('/cart')
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-105 bg-white z-50
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2 font-medium">
            <CartBasketIcon width={20} height={20} fill="#000" />
            <span>{items.length} items in cart</span>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {items.length === 0 && (
            <p className="text-sm text-gray-500 text-center">
              Your cart is empty
            </p>
          )}

          {items.map(item => (
            <div
              key={`${item.id}-${item.size}`}
              className="flex gap-4"
            >
              <Image
                src={
                  item.image &&
                  typeof item.image === "string" &&
                  (item.image.startsWith("http") || item.image.startsWith("/"))
                    ? item.image
                    : "/assets/images/logo.png"
                }
                alt={item.name}
                width={80}
                height={80}
                className="rounded-md border"
              />


              <div className="flex-1">
                <p className="text-sm font-medium">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Size: {item.size}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border rounded">
                    <button
                      className="px-2 py-1 text-sm"
                      onClick={() =>
                        handleDecrease(
                          item.id,
                          item.size,
                          item.quantity,
                          item.itemId
                        )
                      }
                    >
                      −
                    </button>
                    <span className="px-3 text-sm">
                      {item.quantity}
                    </span>
                    <button
                      className="px-2 py-1 text-sm"
                      onClick={() =>
                        handleIncrease(
                          item.id,
                          item.size,
                          item.quantity,
                          item.itemId
                        )
                      }
                    >
                      +
                    </button>
                  </div>

                  <p className="text-sm font-medium">
                    ₹
                    {(
                      getPrice(item.price) *
                      item.quantity
                    ).toFixed(2)}
                  </p>
                </div>
              </div>

              <button
                className="text-red-500 mt-1"
                onClick={() =>
                  handleRemove(item.id, item.size, item.itemId)
                }
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-5 py-4 space-y-3">
            <div className="flex justify-between text-base font-semibold">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="space-y-2 pt-2">
              <button
                className="w-full bg-black text-white py-3 text-sm rounded"
                onClick={handleCart}
              >
                View Cart
              </button>
              <button
                className="w-full bg-black text-white py-3 text-sm rounded"
                onClick={onClose}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
