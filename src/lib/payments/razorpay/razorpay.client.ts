import { ORDERS_URL, PAYMENT_VERIFY } from "@/constants/apis";
import { httpClient } from "@/lib/httpClient";

interface StartCheckoutParams {
  addressId?: string;
  discount?: number;
  onSuccess?: () => void;
  onFailure?: () => void;
}
interface RazorpayOrder {
  razorpayOrderId: string;
  totalAmount: number;
  currency: string;
}

export const startRazorpayCheckout = async ({
  addressId,
  discount,
  onSuccess,
  onFailure,
}: StartCheckoutParams) => {
  try {
    if (typeof window === "undefined") return;

    const orderPayload = {
      address_id: addressId,
      paymentMethod: "ONLINE",
      discountAmount: discount
    }

    // ✅ Step 1: Create Razorpay Order (NOT app order)
    const data = await httpClient.request<RazorpayOrder>({
      url: ORDERS_URL,
      method: "POST",
      requiresAuth: true,
      data: orderPayload,
    });

    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: data.totalAmount,
      currency: 'INR',
      name: "FeetByFoot",
      order_id: data.razorpayOrderId,

      handler: async (response) => {
        try {
          // ✅ Step 2: Verify payment
          const verifyResponse = await httpClient.request<{
            orderId: string;
          }>({
            url: PAYMENT_VERIFY,
            method: "POST",
            requiresAuth: true,
            data: {
              ...response,
              address_id: addressId,
            },
          });
          onSuccess?.()
          const orderId = verifyResponse.orderId;
          window.location.href = `/order/success?orderId=${orderId}`;

        } catch (err) {
          console.error("Verification failed", err);
          onFailure?.();
          window.location.href = `/order/failure`;
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
