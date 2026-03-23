import { EX_UPLOAD_URL } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const response = await fetch(`${EX_UPLOAD_URL}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed from backend");
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Upload failed",
      },
      { status: 500 }
    );
  }
}