import { NextResponse } from "next/server";
import { httpClient } from "@/lib/httpClient";
import { EX_PAYMENT_VERIFY } from "@/constants/apis";


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
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      address_id
    }

    const verifyResponse = await httpClient.request<{
      orderId?: string;
      data?: {
        orderId?: string;
        _id?: string;
      };
    }>({
      url: EX_PAYMENT_VERIFY,
      method: "POST",
      data: JSON.stringify(payloadVerify),
      headers: {
        Authorization: authorization,
      },
    });

    const orderId =
      verifyResponse?.orderId ??
      verifyResponse?.data?.orderId ??
      verifyResponse?.data?._id;

    return NextResponse.json({
      message: "Payment verified successfully",
      orderId,
    });
  } catch (error) {
    console.error("Verify error:", JSON.stringify(error));

    return NextResponse.json(
      { message: "Payment verification failed" },
      { status: 500 }
    );
  }
}
