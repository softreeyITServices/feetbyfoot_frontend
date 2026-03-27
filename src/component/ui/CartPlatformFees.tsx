"use client";

import { useEffect, useMemo, useState } from "react";
import { PlatformFee } from "@/domain/shared/types/platform-fee.type";
import { platformFeesService } from "@/domain/application/services/platformFees.service";
import { CheckoutPaymentMethod } from "@/lib/payments/razorpay/razorpay.client";

type Props = {
  subtotal: number;
  discount?: number;
  handlePayment: () => void;
  paymentMethod: CheckoutPaymentMethod;
  onPaymentMethodChange: (method: CheckoutPaymentMethod) => void;
};

export default function CartPlatformFees({
  subtotal,
  discount = 0,
  handlePayment,
  paymentMethod,
  onPaymentMethodChange,
}: Props) {
  const [fees, setFees] = useState<PlatformFee[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH ACTIVE PLATFORM FEES ---------------- */
  useEffect(() => {
    const fetchFees = async () => {
      try {
        setLoading(true);
        const response = await platformFeesService.getActive();
        setFees(response ?? []);
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, []);

  /* ---------------- CALCULATE FEES ---------------- */
  const calculatedFees = useMemo(() => {
    return fees.map((fee) => {
      let amount = 0;

      const meetsMin =
        !fee.MinAmount || subtotal <= fee.MinAmount;

      if (!meetsMin) return { ...fee, calculatedAmount: 0 };

      if (fee.percentage && fee.percentage > 0) {
        amount = (subtotal * fee.percentage) / 100;
      } else if (fee.amount && fee.amount > 0) {
        amount = fee.amount;
      }

      return { ...fee, calculatedAmount: amount };
    });
  }, [fees, subtotal]);

  const totalPlatformFees = useMemo(() => {
    return calculatedFees.reduce(
      (sum, fee) => sum + fee.calculatedAmount,
      0
    );
  }, [calculatedFees]);

  const totalBeforeDiscount = subtotal + totalPlatformFees;
  const finalTotal = totalBeforeDiscount - discount;

  return (
    <div className="bg-gray-50 p-6 rounded-lg h-fit">
      <h2 className="text-lg font-semibold mb-3">
        Basket Totals
      </h2>

      <div className="flex justify-between text-sm mb-4 border-t pt-6 border-gray-300">
        <span>Subtotal</span>
        <span>₹{subtotal.toFixed(2)}</span>
      </div>

      {/* Platform Fees */}
      <div className="border-t pt-4 border-gray-300">
        <p className="text-sm font-medium mb-3">
          Platform Charges
        </p>

        {loading && (
          <p className="text-xs text-gray-500">
            Loading fees...
          </p>
        )}

        {calculatedFees.map((fee) => (
          <div
            key={fee._id}
            className="flex justify-between text-sm mb-2"
          >
            <span>{fee.name}</span>
            <span>
              ₹{fee.calculatedAmount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

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
        <p className="text-xl font-semibold">
          ₹{finalTotal.toFixed(2)}
        </p>
      </div>

      <div className="border-t mt-6 pt-4">
        <p className="text-sm font-medium mb-3">Payment Method</p>
        <label className="flex items-center gap-2 text-sm mb-2 cursor-pointer">
          <input
            type="radio"
            name="payment-method"
            value="ONLINE"
            checked={paymentMethod === "ONLINE"}
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
            onChange={() => onPaymentMethodChange("COD")}
          />
          Cash on Delivery (COD)
        </label>
      </div>

      <button
        className={`w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded mt-6 font-medium ${finalTotal > 0 ? 'pointer-events-auto': 'pointer-events-none'}`}
        onClick={() => handlePayment()}
      >
        {paymentMethod === "COD" ? "Place COD Order" : "Pay Now"}
      </button>
    </div>
  );
}