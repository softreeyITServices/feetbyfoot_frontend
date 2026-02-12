import { getRazorpayInstance } from "@/lib/payments/razorpay/razorpay.server";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency = "INR" } = body;

    const razorpay = getRazorpayInstance();

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects paise
      currency,
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Razorpay create order error:", error);
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 }
    );
  }
}
