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
import { useRouter } from "next/navigation";
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

export default function CartBody() {
  const router = useRouter();
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
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("ONLINE");
  const [isCheckoutInProgress, setIsCheckoutInProgress] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isServiceable, setIsServiceable] = useState<boolean | null>(null);
  const [isCheckingServiceability, setIsCheckingServiceability] =
    useState(false);

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

          router.push("/order/success");
        } catch (err) {
          console.error("COD checkout error:", err);
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
        onFailure: () => {
          setIsCheckoutInProgress(false);
          alert("Payment cancelled or failed");
        },
      });
    } catch (error) {
      setIsCheckoutInProgress(false);
      console.error("Checkout error:", error);
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
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 md:py-14">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-10">
          Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2">
            {items.length === 0 ? (
              <div className="p-4 sm:p-6 border border-gray-200 rounded-md bg-gray-50">
                <p className="text-gray-500 text-sm sm:text-base">
                  Your cart is empty
                </p>
              </div>
            ) : (
              <div className="p-0">
                {/* Desktop Header - Hidden on mobile */}
                <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr] text-xs text-gray-500 uppercase border-b pb-3 border-gray-300">
                  <div>Product</div>
                  <div className="text-center">Price</div>
                  <div className="text-center">Quantity</div>
                  <div className="text-right">Subtotal</div>
                </div>

                {/* Mobile Header */}
                <div className="sm:hidden text-xs text-gray-500 uppercase border-b pb-2 mb-4 border-gray-300">
                  Products
                </div>

                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`}>
                    {/* Mobile Layout */}
                    <div className="sm:hidden py-4 border-b border-gray-300">
                      <div className="flex gap-3 mb-3">
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
                          width={60}
                          height={60}
                          className="rounded w-16 h-16 object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Size: {item.size}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            ₹{getPrice(item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex border border-gray-300 rounded">
                          <button
                            className="px-3 py-1 text-sm"
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
                          <span className="px-4 py-1 border-x border-gray-300 text-sm">
                            {item.quantity}
                          </span>
                          <button
                            className="px-3 py-1 text-sm"
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
                          <p className="text-sm text-gray-500">Subtotal</p>
                          <p className="font-medium">
                            ₹{(getPrice(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          handleRemove(item.id, item.size, item.itemId)
                        }
                        className="text-red-500 text-xs mt-2"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr] items-center py-6 border-b border-gray-300">
                      {/* Product */}
                      <div className="flex gap-3 md:gap-4">
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
                          width={80}
                          height={80}
                          className="rounded w-16 h-16 md:w-20 md:h-20 object-cover"
                        />

                        <div>
                          <p className="font-medium text-sm md:text-base">
                            {item.name}
                          </p>
                          <p className="text-xs md:text-sm text-gray-500">
                            Size: {item.size}
                          </p>
                          <button
                            onClick={() =>
                              handleRemove(item.id, item.size, item.itemId)
                            }
                            className="text-red-500 text-xs md:text-sm mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-center text-sm md:text-base">
                        ₹{getPrice(item.price).toFixed(2)}
                      </div>

                      {/* Quantity */}
                      <div className="flex justify-center">
                        <div className="flex border border-gray-300 rounded">
                          <button
                            className="px-2 md:px-3 py-1 text-sm"
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
                          <span className="px-3 md:px-4 py-1 border-x border-gray-300 text-sm">
                            {item.quantity}
                          </span>
                          <button
                            className="px-2 md:px-3 py-1 text-sm"
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
                      </div>

                      {/* Subtotal */}
                      <div className="text-right font-medium text-sm md:text-base">
                        ₹{(getPrice(item.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {session && items.length > 0 && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4">
                <h3 className="text-sm font-medium mb-3">Apply Coupon</h3>

                {!couponId ? (
                  <>
                    <div className="flex gap-2 sm:gap-3">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        placeholder="Enter coupon code"
                        className="flex-1 border px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />

                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="bg-black text-white px-3 sm:px-4 py-2 rounded text-sm disabled:opacity-50 whitespace-nowrap"
                      >
                        {couponLoading ? "Applying..." : "Apply"}
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-xs text-red-500 mt-2">{couponError}</p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-300 p-3 rounded">
                    <div>
                      <p className="text-sm font-medium text-green-700">
                        {`Coupon "${couponCode}" applied`}
                      </p>
                      <p className="text-xs text-green-600">
                        You saved ₹{discount.toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-500 text-sm font-medium ml-2"
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
                      onClick={() => router.push("/account/addresses")}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      + Add Shipping Address
                    </button>
                  )}

                  <div className="space-y-2 sm:space-y-3">
                    {shippingAddresses.map((addr) => (
                      <label
                        key={addr._id}
                        className={`flex items-start gap-2 sm:gap-3 border p-2.5 sm:p-3 rounded cursor-pointer transition-colors ${
                          selectedShippingId === addr._id
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
                        onClick={() => router.push("/account/addresses")}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        + Add Billing Address
                      </button>
                    )}

                    <div className="space-y-2 sm:space-y-3">
                      {billingAddresses.map((addr) => (
                        <label
                          key={addr._id}
                          className={`flex items-start gap-2 sm:gap-3 border p-2.5 sm:p-3 rounded cursor-pointer transition-colors ${
                            selectedBillingId === addr._id
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

          {/* RIGHT SIDE - CartPlatformFees */}
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
    </>
  );
}
