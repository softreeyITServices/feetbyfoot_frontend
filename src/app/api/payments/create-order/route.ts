import { EX_ORDERS_URL } from "@/constants/apis";
import { httpClient } from "@/lib/httpClient";
// import { getRazorpayInstance } from "@/lib/payments/razorpay/razorpay.server";
import { NextResponse } from "next/server";


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

    const order = await httpClient.request({
      url: EX_ORDERS_URL,
      method: "POST",
      data: JSON.stringify(body),
      headers: {
        Authorization: authorization,
      },
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
