export const getRazorpayConfig = () => {
  const isProd = process.env.PAYMENT_ENV === "production";

  const keyId = isProd
    ? process.env.RAZORPAY_LIVE_KEY_ID
    : process.env.RAZORPAY_TEST_KEY_ID;

  const keySecret = isProd
    ? process.env.RAZORPAY_LIVE_KEY_SECRET
    : process.env.RAZORPAY_TEST_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not properly configured");
  }

  return { keyId, keySecret };
};
