import { ORDERS_URL, PAYMENT_VERIFY } from "@/constants/apis";
import { httpClient } from "@/lib/httpClient";

interface StartCheckoutParams {
  amount: number;
  addressId?: string;
  onSuccess?: () => void;
  onFailure?: () => void;
}
interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

export const startRazorpayCheckout = async ({
  amount,
  addressId,
  onSuccess,
  onFailure,
}: StartCheckoutParams) => {
  try {
    if (typeof window === "undefined") return;

    // ✅ Step 1: Create Razorpay Order (NOT app order)
    const data = await httpClient.request<RazorpayOrder>({
      url: ORDERS_URL,
      method: "POST",
      requiresAuth: true,
      data: { amount },
    });

    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: data.amount,
      currency: data.currency,
      name: "FeetByFoot",
      order_id: data.id,

      handler: async (response) => {
        try {
          // ✅ Step 2: Verify payment + Create app order (server side)
          await httpClient.request({
            url: PAYMENT_VERIFY,
            method: "POST",
            requiresAuth: true,
            data: {
              ...response,
              address_id: addressId,
            },
          });

          onSuccess?.();

        } catch (err) {
          console.error("Verification failed", err);
          onFailure?.();
        }
      },

      modal: {
        ondismiss: () => {
          onFailure?.();
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (error) {
    console.error("Checkout error:", error);
    onFailure?.();
  }
};
