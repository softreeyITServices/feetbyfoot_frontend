import Razorpay from "razorpay";
import { getRazorpayConfig } from "./razorpay.config";

let razorpay: Razorpay;

export const getRazorpayInstance = () => {
  if (!razorpay) {
    const { keyId, keySecret } = getRazorpayConfig();

    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpay;
};
