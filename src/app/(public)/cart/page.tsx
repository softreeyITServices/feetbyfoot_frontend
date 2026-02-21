"use client";

import Navbar from "@/component/common/navbar";
import Footer from "@/component/common/Footer";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearCart,
  removeFromCart,
  updateQuantity,
} from "@/store/slices/cart.slice";
import { useSession } from "next-auth/react";
import { startRazorpayCheckout } from "@/lib/payments/razorpay/razorpay.client";
import { cartService } from "@/domain/application/services/cart.service";
import { useRouter } from "next/navigation";
import { AddressService } from "@/domain/application/services/address.service";
import { Address } from "@/domain/shared/types/address.types";
import CartPlatformFees from "@/component/ui/CartPlatformFees";
import { setCart } from "@/store/slices/cart.slice";
import { mapBackendCartToRedux } from "@/domain/shared/mappers/cartMapper";
import {
  handleIncreaseCart,
  handleDecreaseCart,
  handleRemoveCart,
} from "@/lib/cartHandler";
import { couponService } from "@/domain/application/services/coupon.service";
import toast from "react-hot-toast";



export default function CartBody() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedShippingId, setSelectedShippingId] =
    useState<string | null>(null);
  const [selectedBillingId, setSelectedBillingId] =
    useState<string | null>(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [addressLoading, setAddressLoading] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponId, setCouponId] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  /* ---------------- PRICE HELPER ---------------- */
  const getPrice = (price: string | number): number => {
    if (typeof price === "number") return price;
    const parsed = Number(price);
    return isNaN(parsed) ? 0 : parsed;
  };

  /* ---------------- SUBTOTAL ---------------- */
  const subtotal = items.reduce(
    (sum, item) => sum + getPrice(item.price) * item.quantity,
    0
  );

  /* ---------------- FETCH ADDRESSES ---------------- */
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!session) return;

      try {
        setAddressLoading(true);

        const res = await AddressService.getAll();

        const sorted = [...res].sort(
          (a, b) => Number(b.isDefault) - Number(a.isDefault)
        );

        setAddresses(sorted);

        const defaultShipping = sorted.find(
          (a) => a.type === "Shipping" && a.isDefault
        );

        const defaultBilling = sorted.find(
          (a) => a.type === "Billing" && a.isDefault
        );

        if (defaultShipping) {
          setSelectedShippingId(defaultShipping._id);
        }

        if (defaultBilling) {
          setSelectedBillingId(defaultBilling._id);
        }
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      } finally {
        setAddressLoading(false);
      }
    };

    fetchAddresses();
  }, [session]);

  useEffect(() => {
    setDiscount(0);
    setCouponId(null);
  }, [items]);

  const shippingAddresses = addresses.filter(
    (a) => a.type === "Shipping"
  );
  const billingAddresses = addresses.filter(
    (a) => a.type === "Billing"
  );

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      setCouponLoading(true);
      setCouponError(null);

      const response = await couponService.applyCoupon({
        code: couponCode,
        orderAmount: subtotal,
      });

      setDiscount(response.discount);
      setCouponId(response.couponId);
      toast.success("Coupon code added successfully")
    } catch (error: unknown) {
      if (error instanceof Error) {
        setCouponError(error.message);
      } else {
        setCouponError("Failed to apply coupon");
      }
    } finally {
      setCouponLoading(false);
    }
  };

  /* ---------------- CART ACTIONS ---------------- */

  const refreshBackendCart = async () => {
    const dbCart = await cartService.getCart();
    dispatch(setCart(mapBackendCartToRedux(dbCart.data.data.items)));
  };

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
      refreshBackend: refreshBackendCart,
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
      refreshBackend: refreshBackendCart,
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
      refreshBackend: refreshBackendCart,
    });
  };

  /* ---------------- PAYMENT ---------------- */
  const handlePayment = async () => {
    try {
      if (status === "loading") return;

      if (!session) {
        router.push("/login?redirect=/cart");
        return;
      }

      if (!selectedShippingId) {
        alert("Please select a shipping address");
        return;
      }

      if (!sameAsShipping && !selectedBillingId) {
        alert("Please select a billing address");
        return;
      }

      await startRazorpayCheckout({
        addressId: selectedShippingId,
        discount,
        onSuccess: async () => {
          dispatch(clearCart());
        },
        onFailure: () => {
          alert("Payment Failed");
        },
      });
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setCouponId(null);
    setCouponCode("");
    setCouponError(null);
    toast.success("Coupon code removed successfully")
  };

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-14">
        <h1 className="text-3xl font-semibold mb-10">Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2">
            <div className="p-0">
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
                          handleRemove(item.id, item.size, item.itemId)
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
                            item.quantity,
                            item.itemId
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
                            item.quantity,
                            item.itemId
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
            {session && items.length > 0 && (
              <div className="mt-6 p-4">
                <h3 className="text-sm font-medium mb-3">
                  Apply Coupon
                </h3>

                {!couponId ? (
                  <>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        placeholder="Enter coupon code"
                        className="flex-1 border px-3 py-2 rounded text-sm"
                      />

                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                      >
                        {couponLoading ? "Applying..." : "Apply"}
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-xs text-red-500 mt-2">
                        {couponError}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-300 p-3 rounded">
                    <div>
                      <p className="text-sm font-medium text-green-700">
                        {`Coupon ${couponCode}" applied`}
                      </p>
                      <p className="text-xs text-green-600">
                        You saved ₹{discount.toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-500 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            {items && items.length > 0 && <>
              <div className="mb-8 p-4">
                <h3 className="font-medium mb-4 text-sm">Shipping Address</h3>

                {addressLoading && (
                  <p className="text-sm text-gray-500">Loading addresses...</p>
                )}

                {!addressLoading && shippingAddresses.length === 0 && (
                  <button
                    onClick={() => router.push("/account/addresses")}
                    className="text-blue-600 text-sm"
                  >
                    + Add Shipping Address
                  </button>
                )}

                {shippingAddresses.map(addr => (
                  <label
                    key={addr._id}
                    className={`flex items-start gap-3 border p-3 rounded mb-3 cursor-pointer ${selectedShippingId === addr._id
                      ? "border-green-600 bg-green-50"
                      : "border-gray-300"
                      }`}
                  >
                    <input
                      type="radio"
                      checked={selectedShippingId === addr._id}
                      onChange={() => setSelectedShippingId(addr._id)}
                    />

                    <div className="text-sm">
                      <p className="font-medium">{addr.fullName}</p>
                      <p>{addr.addressLine1}</p>
                      <p>
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      {addr.isDefault && (
                        <span className="text-xs text-green-600">Default</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>


              {/* BILLING SAME AS SHIPPING */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={() => setSameAsShipping(!sameAsShipping)}
                  />
                  Billing address same as shipping
                </label>
              </div>

              {/* BILLING ADDRESS */}
              {!sameAsShipping && (
                <div className="mb-8 p-4 rounded border border-gray-200">
                  <h3 className="font-medium mb-4 text-sm">Billing Address</h3>

                  {billingAddresses.length === 0 && (
                    <button
                      onClick={() => router.push("/account/addresses")}
                      className="text-blue-600 text-sm"
                    >
                      + Add Billing Address
                    </button>
                  )}

                  {billingAddresses.map(addr => (
                    <label
                      key={addr._id}
                      className={`flex items-start gap-3 border p-3 rounded mb-3 cursor-pointer ${selectedBillingId === addr._id
                        ? "border-green-600 bg-green-50"
                        : "border-gray-300"
                        }`}
                    >
                      <input
                        type="radio"
                        checked={selectedBillingId === addr._id}
                        onChange={() => setSelectedBillingId(addr._id)}
                      />

                      <div className="text-sm">
                        <p className="font-medium">{addr.fullName}</p>
                        <p>{addr.addressLine1}</p>
                        <p>
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        {addr.isDefault && (
                          <span className="text-xs text-green-600">Default</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </>}
          </div>

          {/* RIGHT SIDE */}
          <CartPlatformFees
            subtotal={subtotal}
            discount={discount}
            handlePayment={handlePayment}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}
