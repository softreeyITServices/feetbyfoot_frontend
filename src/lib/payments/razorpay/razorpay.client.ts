interface StartCheckoutParams {
  amount: number;
  onSuccess?: () => void;
  onFailure?: () => void;
}

export const startRazorpayCheckout = async ({
  amount,
  onSuccess,
  onFailure,
}: StartCheckoutParams) => {
  try {
    const res = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });

    if (!res.ok) {
      throw new Error("Failed to create order");
    }

    const order: {
      id: string;
      amount: number;
      currency: string;
    } = await res.json();

    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "FeetByFoot",
      order_id: order.id,
      handler: async (response) => {
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(response),
        });

        if (!verifyRes.ok) {
          throw new Error("Payment verification failed");
        }

        onSuccess?.();
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
