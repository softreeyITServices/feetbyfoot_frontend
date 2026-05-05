"use client";

import { useEffect, useState } from "react";
import { AppliedFee } from "@/domain/shared/types/cart.type";
import { CheckoutPaymentMethod } from "@/lib/payments/razorpay/razorpay.client";
import { cartService } from "@/domain/application/services/cart.service";

type Props = {
  subtotal: number;
  discount?: number;
  handlePayment: () => void;
  paymentMethod: CheckoutPaymentMethod;
  onPaymentMethodChange: (method: CheckoutPaymentMethod) => void;
  isCheckoutInProgress?: boolean;
  isDisabled?: boolean;
};

export default function CartPlatformFees({
  subtotal,
  discount = 0,
  handlePayment,
  paymentMethod,
  onPaymentMethodChange,
  isCheckoutInProgress = false,
  isDisabled = false,
}: Props) {
  const [appliedFees, setAppliedFees] = useState<AppliedFee[]>([]);
  const [platformFee, setPlatformFee] = useState<number>(0);
  const [cartLoading, setCartLoading] = useState(false);
  const hasCartItems = subtotal > 0;

  /* ---------------- FETCH CART WITH PAYMENT METHOD ---------------- */
  useEffect(() => {
    if (!hasCartItems) return;

    const fetchCartPricing = async () => {
      try {
        setCartLoading(true);
        const response: any = await cartService.getCart(paymentMethod);
        const cart = response?.data;
        setAppliedFees(cart?.appliedFees ?? []);
        setPlatformFee(cart?.platformFee ?? 0);
      } finally {
        setCartLoading(false);
      }
    };

    fetchCartPricing();
  }, [paymentMethod, hasCartItems]);

  const finalTotal = subtotal + platformFee - discount;

  return (
    <div className="bg-gray-50 p-6 rounded-lg h-fit">
      <h2 className="text-lg font-semibold mb-3">Basket Totals</h2>

      <div className="flex justify-between text-sm mb-4 border-t pt-6 border-gray-300">
        <span>Subtotal</span>
        <span>₹{subtotal.toFixed(2)}</span>
      </div>

      {/* Platform Fees — skeleton while cart pricing loads */}
      {hasCartItems && (
        <div className="border-t pt-4 border-gray-300">
          <p className="text-sm font-medium mb-3">Platform Charges</p>

          {cartLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded w-14" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-14" />
              </div>
            </div>
          ) : platformFee === 0 ? (
            <div className="flex justify-between text-sm mb-2">
              <span>Platform Fee</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
          ) : (
            appliedFees.map((fee, i) => (
              <div key={i} className="flex justify-between text-sm mb-2">
                <span>{fee.name}</span>
                <span>₹{fee.amount.toFixed(2)}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Discount */}
      {discount > 0 && (
        <div className="flex justify-between text-sm mt-4 text-green-600">
          <span>Coupon Discount</span>
          <span>- ₹{discount.toFixed(2)}</span>
        </div>
      )}

      {/* Total */}
      <div className="border-t mt-6 pt-4 flex justify-between items-center border-gray-300">
        <p className="font-semibold">Total</p>
        {cartLoading ? (
          <div className="h-7 bg-gray-200 rounded w-24 animate-pulse" />
        ) : (
          <div className="text-right">
            <p className="text-xl font-semibold">₹{finalTotal.toFixed(2)}</p>
            <p className="text-[10px] text-gray-500 mt-1">(Inclusive of GST)</p>
          </div>
        )}
      </div>

      <div className="border-t mt-6 pt-4">
        <p className="text-sm font-medium mb-3">Payment Method</p>
        <label className="flex items-center gap-2 text-sm mb-2 cursor-pointer">
          <input
            type="radio"
            name="payment-method"
            value="ONLINE"
            checked={paymentMethod === "ONLINE"}
            disabled={isCheckoutInProgress}
            onChange={() => onPaymentMethodChange("ONLINE")}
          />
          Pay now (Online)
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name="payment-method"
            value="COD"
            checked={paymentMethod === "COD"}
            disabled={isCheckoutInProgress}
            onChange={() => onPaymentMethodChange("COD")}
          />
          Cash on Delivery (COD)
        </label>
      </div>

      <button
        className={`w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded mt-6 font-medium disabled:opacity-60 disabled:cursor-not-allowed ${finalTotal > 0 ? "pointer-events-auto" : "pointer-events-none"}`}
        onClick={() => handlePayment()}
        disabled={isCheckoutInProgress || finalTotal <= 0 || isDisabled}
      >
        {isCheckoutInProgress
          ? "Processing..."
          : paymentMethod === "COD"
            ? "Place COD Order"
            : "Pay Now"}
      </button>
    </div>
  );
}
