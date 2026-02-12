export { };

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }


  interface RazorpayOptions {
    key: string | undefined;
    amount: number;
    currency: string;
    name: string;
    order_id: string;
    handler: (response: RazorpaySuccessResponse) => void;
    modal?: {
      ondismiss?: () => void;
    };
  }

  interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  interface RazorpayInstance {
    open(): void;
  }
}