import { NextResponse } from "next/server";
import { httpClient } from "@/lib/httpClient";
import { EX_ORDERS_URL, EX_PAYMENT_VERIFY } from "@/constants/apis";


export async function POST(req: Request) {
  try {
    const authorization = req.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Missing Authorization header" },
        { status: 401 },
      );
    }
    const body = await req.json();

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      address_id
    } = body;

    const payloadVerify = {
      razorpayOrderId: razorpay_payment_id,
      razorpayPaymentId: razorpay_order_id,
      razorpaySignature: razorpay_signature
    }

    const response = await httpClient.request({
      url: EX_PAYMENT_VERIFY,
      method: "POST",
      data: payloadVerify,
      headers: {
        Authorization: authorization,
      },
    });

    if (response) {
      const orderPayload = {
        address_id,
        paymentMethod: "ONLINE"

      }
      try {
        await httpClient.request({
          url: EX_ORDERS_URL,
          method: "POST",
          data: orderPayload,
          headers: {
            Authorization: authorization,
          },
        });
      } catch {
        return NextResponse.json(
          { message: "Order creation failed" },
          { status: 500 }
        );
      }
    }

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
