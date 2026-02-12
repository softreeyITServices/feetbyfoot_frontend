import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = body;

    const secret =
      process.env.PAYMENT_ENV === "production"
        ? process.env.RAZORPAY_LIVE_KEY_SECRET
        : process.env.RAZORPAY_TEST_KEY_SECRET;

    if (!secret) {
      throw new Error("Razorpay secret not configured");
    }

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // ✅ TODO:
    // 1. Mark order as PAID in DB
    // 2. Reduce inventory
    // 3. Clear cart (optional if using session)

    return NextResponse.json({
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Verify error:", error);

    return NextResponse.json(
      { message: "Payment verification failed" },
      { status: 500 }
    );
  }
}
