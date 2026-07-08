"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearCart,
  removeFromCart,
  updateQuantity,
} from "@/store/slices/cart.slice";
import { useSession } from "next-auth/react";
import {
  CheckoutPaymentMethod,
  placeCodOrder,
  startRazorpayCheckout,
} from "@/lib/payments/razorpay/razorpay.client";
import { cartService } from "@/domain/application/services/cart.service";
import { useRouter, usePathname } from "next/navigation";
import { AddressService } from "@/domain/application/services/address.service";
import { Address } from "@/domain/shared/types/address.types";
import CartPlatformFees from "@/component/ui/CartPlatformFees";
import { setCart } from "@/store/slices/cart.slice";
import { mapCartApiResponseToRedux } from "@/domain/shared/mappers/cartMapper";
import {
  handleIncreaseCart,
  handleDecreaseCart,
  handleRemoveCart,
} from "@/lib/cartHandler";
import { couponService } from "@/domain/application/services/coupon.service";
import toast from "react-hot-toast";
import { DeliveryService } from "@/domain/application/services/delivery.service";

import { X, Tag, ChevronDown, ChevronUp } from "lucide-react";

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  if (!isOpen) return null;
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);

  console.log("items", items);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(
    null,
  );
  const [selectedBillingId, setSelectedBillingId] = useState<string | null>(
    null,
  );
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [addressLoading, setAddressLoading] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponId, setCouponId] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("ONLINE");
  const [isCheckoutInProgress, setIsCheckoutInProgress] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isServiceable, setIsServiceable] = useState<boolean | null>(null);
  const [isCheckingServiceability, setIsCheckingServiceability] =
    useState(false);

  /* ---------------- FETCH COUPONS ---------------- */
  useEffect(() => {
    const fetchCoupons = async () => {
      if (!isOpen) return;
      try {
        const res: any = await couponService.getAllActiveCoupons();
        setAvailableCoupons(res?.data || []);
      } catch (err) {
        console.error("Failed to load coupons", err);
      }
    };
    fetchCoupons();
  }, [isOpen]);

  /* ---------------- PRICE HELPER ---------------- */
  const getPrice = (price: string | number): number => {
    if (typeof price === "number") return price;
    const parsed = Number(price);
    return isNaN(parsed) ? 0 : parsed;
  };

  /* ---------------- SUBTOTAL ---------------- */
  const subtotal = items.reduce(
    (sum, item) => sum + getPrice(item.price) * item.quantity,
    0,
  );

  /* ---------------- FETCH ADDRESSES ---------------- */
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!session) return;

      try {
        setAddressLoading(true);

        const res = await AddressService.getAll();

        const sorted = [...res].sort(
          (a, b) => Number(b.isDefault) - Number(a.isDefault),
        );

        setAddresses(sorted);

        const defaultShipping = sorted.find(
          (a) => a.type === "Shipping" && a.isDefault,
        );

        console.log("defaultShipping", defaultShipping);

        const defaultBilling = sorted.find(
          (a) => a.type === "Billing" && a.isDefault,
        );

        console.log("defaultBilling", defaultBilling);

        if (defaultShipping) {
          setSelectedShippingId(defaultShipping?._id);
        }

        if (defaultBilling) {
          setSelectedBillingId(defaultBilling?._id);
        }
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      } finally {
        setAddressLoading(false);
      }
    };

    const syncCartWithBackend = async () => {
      if (status === "authenticated") {
        try {
          setIsSyncing(true);
          const response = await cartService.getCart();
          const cartData = response?.data?.data;

          if (cartData) {
            dispatch(setCart(mapCartApiResponseToRedux(response)));

            // Sync coupon state if it exists on backend
            if (cartData.couponCode) {
              setCouponCode(cartData.couponCode);
              setCouponId(cartData.couponCode);
              setDiscount(cartData.discountAmount || 0);
            }
          }
        } catch (error) {
          console.error("Failed to sync cart on mount:", error);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    fetchAddresses();
    syncCartWithBackend();
  }, [session, status, dispatch]);

  console.log("selectedShippingId", selectedShippingId);
  console.log("selectedBillingId", selectedBillingId);


  /* ---------------- CHECK SERVICEABILITY ---------------- */
  useEffect(() => {
    const checkServiceability = async () => {
      if (!selectedShippingId) {
        setIsServiceable(null);
        return;
      }

      const selectedAddr = addresses.find((a) => a._id === selectedShippingId);
      if (!selectedAddr) return;

      try {
        setIsCheckingServiceability(true);
        const res = await DeliveryService.checkServiceability(
          selectedAddr.pincode,
        );
        setIsServiceable(
          !!(res.delivery_codes && res.delivery_codes.length > 0),
        );
      } catch (error) {
        console.error("Failed to check serviceability:", error);
        setIsServiceable(null);
      } finally {
        setIsCheckingServiceability(false);
      }
    };

    checkServiceability();
  }, [selectedShippingId, addresses]);

  const shippingAddresses = addresses.filter((a) => a.type === "Shipping");
  const billingAddresses = addresses.filter((a) => a.type === "Billing");

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      setCouponLoading(true);
      setCouponError(null);

      const response = await couponService.applyCoupon({
        code: couponCode,
        orderAmount: subtotal,
      });

      console.log("response", response);

      setDiscount(response.discount);
      setCouponId(response.couponCode);
      toast.success("Coupon code added successfully");
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
    const response = await cartService.getCart();
    const cartData = response?.data?.data;
    dispatch(setCart(mapCartApiResponseToRedux(response)));

    if (cartData) {
      if (cartData.couponCode) {
        setCouponCode(cartData.couponCode);
        setCouponId(cartData.couponCode);
        setDiscount(cartData.discountAmount || 0);
      } else {
        setCouponId(null);
        setDiscount(0);
      }
    }
  };

  const handleIncrease = async (
    id: string,
    size: string,
    quantity: number,
    itemId?: string,
  ) => {
    const currentItem = items.find((i) => i.id === id && i.size === size);
    const latestQty = currentItem?.quantity ?? quantity;

    setIsSyncing(true);
    await handleIncreaseCart({
      id,
      size,
      quantity: latestQty,
      itemId,
      isAuthenticated: !!session,
      onLocalUpdate: () =>
        dispatch(updateQuantity({ id, size, quantity: latestQty + 1 })),
      refreshBackend: refreshBackendCart,
    });
    setIsSyncing(false);
  };

  const handleDecrease = async (
    id: string,
    size: string,
    quantity: number,
    itemId?: string,
  ) => {
    const currentItem = items.find((i) => i.id === id && i.size === size);
    const latestQty = currentItem?.quantity ?? quantity;

    if (latestQty <= 1) {
      await handleRemove(id, size, itemId);
      return;
    }

    setIsSyncing(true);
    await handleDecreaseCart({
      id,
      size,
      quantity: latestQty,
      itemId,
      isAuthenticated: !!session,
      onLocalUpdate: () =>
        dispatch(updateQuantity({ id, size, quantity: latestQty - 1 })),
      refreshBackend: refreshBackendCart,
    });
    setIsSyncing(false);
  };

  const handleRemove = async (id: string, size: string, itemId?: string) => {
    setIsSyncing(true);
    await handleRemoveCart({
      id,
      size,
      itemId,
      isAuthenticated: !!session,
      onLocalUpdate: () => dispatch(removeFromCart({ id, size })),
      refreshBackend: refreshBackendCart,
    });
    setIsSyncing(false);
  };

  /* ---------------- PAYMENT ---------------- */
  const handlePayment = async () => {
    try {
      if (isCheckoutInProgress) return;
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

      if (paymentMethod === "COD") {
        setIsCheckoutInProgress(true);
        try {
          const orderId = await placeCodOrder({
            addressId: selectedShippingId,
            discount,
          });

          await cartService.clearAllServerItems();
          dispatch(clearCart());

          if (orderId) {
            router.push(`/order/success?orderId=${orderId}`);
            return;
          }

          onClose();
          router.push("/order/success");
        } catch (err: any) {
          console.error("COD checkout error:", err);

          // 🔥 Handle Expired Session
          if (err?.status === 401 || err?.response?.status === 401) {
            toast.error("Your session has expired. Please login again.");
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
          }

          toast.error(
            err instanceof Error ? err.message : "Could not complete order",
          );
        } finally {
          setIsCheckoutInProgress(false);
        }
        return;
      }

      setIsCheckoutInProgress(true);
      await startRazorpayCheckout({
        addressId: selectedShippingId,
        discount,
        onSuccess: async () => {
          try {
            await cartService.clearAllServerItems();
          } catch (err) {
            console.error("Failed to clear server cart after payment:", err);
            toast.error(
              err instanceof Error
                ? err.message
                : "Order placed but cart could not be cleared on the server",
            );
          } finally {
            dispatch(clearCart());
            setIsCheckoutInProgress(false);
          }
        },
        onFailure: (error: any) => {
          localStorage.removeItem("is_processing_payment"); // 🔥 UNLOCK
          setIsCheckoutInProgress(false);

          // 🔥 Handle Expired Session in Online Flow
          if (error?.status === 401 || error?.response?.status === 401) {
            toast.error("Your session has expired. Please login again.");
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
          }

          alert(error || "Payment cancelled or failed");
        },
      });
    } catch (error: any) {
      setIsCheckoutInProgress(false);
      console.error("Checkout error:", error);

      // 🔥 Handle Expired Session in Initial Order Creation
      if (error?.status === 401 || error?.response?.status === 401) {
        toast.error("Your session has expired. Please login again.");
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await couponService.removeCoupon();
      setDiscount(0);
      setCouponId(null);
      setCouponCode("");
      setCouponError(null);
      toast.success("Coupon code removed successfully");
    } catch (error) {
      console.error("Failed to remove coupon:", error);
      toast.error("Failed to remove coupon code");
    }
  };

  console.log(shippingAddresses);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto relative animate-in slide-in-from-right duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 z-10">
          <X size={24} />
        </button>
        <main className="px-4 sm:px-6 py-6 sm:py-10 md:py-14">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-10">
          Cart
        </h1>

        <div className="flex flex-col gap-6 h-full pb-32">
          {/* TOP SIDE: Cart Items */}
          <div className="flex-1">
            {items.length === 0 ? (
              <div className="p-4 sm:p-6 border border-gray-200 rounded-md bg-gray-50">
                <p className="text-gray-500 text-sm sm:text-base">
                  Your cart is empty
                </p>
              </div>
            ) : (
              <div className="p-0">
                {/* Header */}
                <div className="text-xs text-gray-500 uppercase border-b pb-2 mb-4 border-gray-300">
                  Products
                </div>

                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`}>
                    <div className="py-4 border-b border-gray-300">
                      <div className="flex gap-4">
                        <Image
                          src={
                            item.image &&
                              typeof item.image === "string" &&
                              (item.image.startsWith("http") ||
                                item.image.startsWith("/"))
                              ? item.image
                              : "/assets/images/logo.png"
                          }
                          alt={item.name}
                          width={72}
                          height={72}
                          className="rounded w-18 h-18 object-cover border border-gray-100"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <p className="font-semibold text-sm text-gray-800 line-clamp-2 leading-snug">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Size: {item.size}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border border-gray-300 rounded-md bg-white">
                              <button
                                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-l-md transition-colors"
                                onClick={() =>
                                  handleDecrease(
                                    item.id,
                                    item.size,
                                    item.quantity,
                                    item.itemId,
                                  )
                                }
                              >
                                −
                              </button>
                              <span className="px-3 py-1 border-x border-gray-300 text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-r-md transition-colors"
                                onClick={() =>
                                  handleIncrease(
                                    item.id,
                                    item.size,
                                    item.quantity,
                                    item.itemId,
                                  )
                                }
                              >
                                +
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-sm text-gray-900">
                                ₹{(getPrice(item.price) * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleRemove(item.id, item.size, item.itemId)
                            }
                            className="text-red-500 hover:text-red-700 text-xs text-left w-fit mt-2 font-medium transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>


                  </div>
                ))}
              </div>
            )}
            {session && items.length > 0 && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 border-y border-gray-200">
                {!couponId ? (
                  <div className="flex flex-col gap-4">
                    {/* Collapsible Button */}
                    <button
                      onClick={() => setShowCoupons(!showCoupons)}
                      className="flex items-center justify-between w-full p-4 bg-pink-50 border border-pink-200 rounded-lg hover:bg-pink-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Tag className="w-5 h-5 text-pink-600" />
                        <div className="text-left">
                          <p className="font-semibold text-pink-900">Offers & Rewards</p>
                          <p className="text-xs text-pink-700">
                            {availableCoupons.length} coupon{availableCoupons.length !== 1 ? 's' : ''} available
                          </p>
                        </div>
                      </div>
                      {showCoupons ? (
                        <ChevronUp className="w-5 h-5 text-pink-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-pink-600" />
                      )}
                    </button>

                    {/* Collapsible List */}
                    {showCoupons && (
                      <div className="flex flex-col gap-3">
                        {availableCoupons.map((coupon, idx) => {
                          const isEligible = subtotal >= coupon.minOrderValue;
                          return (
                            <div key={idx} className={`p-4 border rounded-lg ${isEligible ? "bg-white border-pink-200" : "bg-gray-100 border-gray-200 opacity-70"}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="inline-block px-2 py-1 bg-pink-100 text-pink-700 font-bold text-xs rounded border border-pink-300 border-dashed uppercase">
                                    {coupon.code}
                                  </div>
                                  <p className="text-sm font-medium mt-2 text-gray-800">
                                    {coupon.discountType === "FLAT" ? `Flat ₹${coupon.discountValue} OFF` : `${coupon.discountValue}% OFF`}
                                  </p>
                                  {coupon.minOrderValue > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      On minimum order of ₹{coupon.minOrderValue}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    setCouponCode(coupon.code);
                                    // Trigger apply directly since we set the state, but state is async so we pass the code
                                    const synthEvent = { target: { value: coupon.code } };
                                    setCouponCode(coupon.code);
                                    // Hack: simulate the apply click.
                                    setTimeout(() => document.getElementById("apply-btn")?.click(), 10);
                                  }}
                                  disabled={!isEligible || couponLoading}
                                  className={`text-sm font-bold uppercase tracking-wide px-3 py-1.5 rounded ${isEligible ? "text-pink-600 hover:bg-pink-50" : "text-gray-400 cursor-not-allowed"}`}
                                >
                                  Apply
                                </button>
                              </div>
                              {!isEligible && (
                                <p className="text-xs text-red-500 mt-2">
                                  Add ₹{(coupon.minOrderValue - subtotal).toFixed(2)} more to unlock!
                                </p>
                              )}
                            </div>
                          );
                        })}

                        {/* Manual Entry Fallback */}
                        <div className="mt-2 pt-4 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Have a special code?</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              placeholder="Enter coupon code"
                              className="flex-1 border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:border-pink-500"
                            />
                            <button
                              id="apply-btn"
                              onClick={handleApplyCoupon}
                              disabled={couponLoading || !couponCode.trim()}
                              className="bg-black text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
                            >
                              {couponLoading ? "..." : "APPLY"}
                            </button>
                          </div>
                          {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-pink-50 border border-pink-200 p-4 rounded-lg">
                    <div className="flex gap-3 items-center">
                      <div className="p-2 bg-pink-100 rounded-full">
                        <Tag className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-pink-900">
                          {`'${couponCode}' applied`}
                        </p>
                        <p className="text-xs font-medium text-pink-700 mt-0.5">
                          You saved ₹{discount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-pink-600 text-sm font-bold tracking-wide hover:underline uppercase"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            {items && items.length > 0 && (
              <>
                <div className="mb-6 sm:mb-8 p-3 sm:p-4">
                  <h3 className="font-medium mb-3 sm:mb-4 text-sm">
                    Shipping Address
                  </h3>

                  {addressLoading && (
                    <p className="text-sm text-gray-500">
                      Loading addresses...
                    </p>
                  )}

                  {!addressLoading && shippingAddresses.length === 0 && (
                    <button
                      onClick={() => { onClose(); router.push("/account/addresses"); }}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      + Add Shipping Address
                    </button>
                  )}

                  <div className="space-y-2 sm:space-y-3">
                    {shippingAddresses.map((addr) => (
                      <label
                        key={addr._id}
                        className={`flex items-start gap-2 sm:gap-3 border p-2.5 sm:p-3 rounded cursor-pointer transition-colors ${selectedShippingId === addr._id
                            ? "border-green-600 bg-green-50"
                            : "border-gray-300 hover:border-gray-400"
                          }`}
                      >
                        <input
                          type="radio"
                          checked={selectedShippingId === addr._id}
                          onChange={() => setSelectedShippingId(addr._id)}
                          className="mt-0.5"
                        />

                        <div className="text-xs sm:text-sm flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                            <p className="font-medium truncate">
                              {addr.fullName}
                            </p>
                            <div className="flex gap-2 items-center">
                              {selectedShippingId === addr._id &&
                                isCheckingServiceability && (
                                  <span className="text-[10px] sm:text-xs text-gray-500 animate-pulse whitespace-nowrap">
                                    Checking...
                                  </span>
                                )}
                              {selectedShippingId === addr._id &&
                                isServiceable === false && (
                                  <span className="text-[10px] sm:text-xs text-red-500 font-bold italic whitespace-nowrap">
                                    NOT SERVICEABLE
                                  </span>
                                )}
                              {selectedShippingId === addr._id &&
                                isServiceable === true && (
                                  <span className="text-[10px] sm:text-xs text-green-600 font-bold whitespace-nowrap">
                                    ✓ SERVICEABLE
                                  </span>
                                )}
                            </div>
                          </div>
                          <p className="break-words">{addr.addressLine1}</p>
                          <p>
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <div className="flex gap-3 items-center mt-1">
                            {addr.isDefault && (
                              <span className="text-[10px] sm:text-xs text-green-600">
                                Default
                              </span>
                            )}
                            {selectedShippingId === addr._id &&
                              isServiceable === false && (
                                <p className="text-[10px] sm:text-xs text-red-600 font-medium">
                                  ⚠️ We cannot deliver to this pincode
                                </p>
                              )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* BILLING SAME AS SHIPPING */}
                <div className="mb-4 sm:mb-6">
                  <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={() => setSameAsShipping(!sameAsShipping)}
                      className="rounded"
                    />
                    Billing address same as shipping
                  </label>
                </div>

                {/* BILLING ADDRESS */}
                {!sameAsShipping && (
                  <div className="mb-6 sm:mb-8 p-3 sm:p-4 rounded border border-gray-200">
                    <h3 className="font-medium mb-3 sm:mb-4 text-sm">
                      Billing Address
                    </h3>

                    {billingAddresses.length === 0 && (
                      <button
                        onClick={() => { onClose(); router.push("/account/addresses"); }}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        + Add Billing Address
                      </button>
                    )}

                    <div className="space-y-2 sm:space-y-3">
                      {billingAddresses.map((addr) => (
                        <label
                          key={addr._id}
                          className={`flex items-start gap-2 sm:gap-3 border p-2.5 sm:p-3 rounded cursor-pointer transition-colors ${selectedBillingId === addr._id
                              ? "border-green-600 bg-green-50"
                              : "border-gray-300 hover:border-gray-400"
                            }`}
                        >
                          <input
                            type="radio"
                            checked={selectedBillingId === addr._id}
                            onChange={() => setSelectedBillingId(addr._id)}
                            className="mt-0.5"
                          />

                          <div className="text-xs sm:text-sm min-w-0">
                            <p className="font-medium truncate">
                              {addr.fullName}
                            </p>
                            <p className="break-words">{addr.addressLine1}</p>
                            <p>
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            {addr.isDefault && (
                              <span className="text-[10px] sm:text-xs text-green-600">
                                Default
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* BOTTOM SIDE - CartPlatformFees */}
          {items.length > 0 && (
            <CartPlatformFees
              subtotal={subtotal}
              discount={discount}
              handlePayment={handlePayment}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              isCheckoutInProgress={isCheckoutInProgress}
              isSyncing={isSyncing}
              isDisabled={isServiceable === false || isCheckingServiceability}
            />
          )}
        </div>
      </main>
      </div>
    </div>
  );
}
