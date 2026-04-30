import { ORDERS_URL, PAYMENT_VERIFY } from "@/constants/apis";
import { httpClient } from "@/lib/httpClient";

export type CheckoutPaymentMethod = "ONLINE" | "COD";

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
  orderId?: string;
  _id?: string;
  data?: {
    orderId?: string;
    _id?: string;
  };
}

interface CodOrderResponse {
  orderId?: string;
  data?: {
    orderId?: string;
    _id?: string;
  };
}

const extractOrderId = (response: CodOrderResponse): string | null => {
  if (response?.orderId) return response.orderId;
  if (response?.data?.orderId) return response.data.orderId;
  if (response?.data?._id) return response.data._id;
  return null;
};

const extractCreatedOrderId = (response: RazorpayOrder): string | null => {
  if (response?.orderId) return response.orderId;
  if (response?._id) return response._id;
  if (response?.data?.orderId) return response.data.orderId;
  if (response?.data?._id) return response.data._id;
  return null;
};

const cancelPendingOrder = async (orderId: string) => {
  await httpClient.request({
    url: `/api/orders/${orderId}/cancel`,
    method: "PATCH",
    requiresAuth: true,
    data: {
      reason: "Payment cancelled by user",
    },
  });
};

export const placeCodOrder = async ({
  addressId,
  discount,
}: {
  addressId?: string;
  discount?: number;
}) => {
  const orderPayload = {
    address_id: addressId,
    paymentMethod: "COD" as CheckoutPaymentMethod,
    discountAmount: discount,
  };

  const response = await httpClient.request<CodOrderResponse>({
    url: ORDERS_URL,
    method: "POST",
    requiresAuth: true,
    data: orderPayload,
  });

  return extractOrderId(response);
};

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
      discountAmount: discount,
    };

    // ✅ Step 1: Create Razorpay Order (NOT app order)
    const data = await httpClient.request<RazorpayOrder>({
      url: ORDERS_URL,
      method: "POST",
      requiresAuth: true,
      data: orderPayload,
    });
    const createdOrderId = extractCreatedOrderId(data);

    console.log("data",data)

    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: data.totalAmount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      name: "FeetByFoot",
      order_id: data.razorpayOrderId
,

      handler: async (response) => {
        try {
          // ✅ Step 2: Verify payment
          // Razorpay returns: razorpay_payment_id, razorpay_order_id, razorpay_signature
          // Backend DTO expects: razorpayPaymentId, razorpayOrderId, razorpaySignature
          const verifyResponse = await httpClient.request<{
            orderId: string;
          }>({
            url: PAYMENT_VERIFY,
            method: "POST",
            requiresAuth: true,
            data: {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              address_id: addressId,
            },
          });
          onSuccess?.();
          const orderId = verifyResponse.orderId;
          window.location.href = `/order/success?orderId=${orderId}`;

        } catch (err) {
          console.error("Verification failed", err);
          onFailure?.();
          window.location.href = `/order/failure`;
        }
      },

      modal: {
        ondismiss: async () => {
          try {
            if (createdOrderId) {
              await cancelPendingOrder(createdOrderId);
            }
          } catch (cancelError) {
            console.error("Failed to cancel pending online order", cancelError);
          } finally {
            onFailure?.();
          }
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
