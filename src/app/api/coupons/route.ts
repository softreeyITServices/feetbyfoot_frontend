import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_COUPONS_URL } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";

export const GET = apiHandler(
  async () => {
    try {
      const response = await httpClient.get(
        `${EX_COUPONS_URL}`,
      );

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ?? error.message ?? "Failed to fetch coupons",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  {
    allowedMethods: ["GET"],
  }
);

export const POST = apiHandler(
  async (req: NextRequest) => {
    try {
      const authorization = req.headers.get("authorization");

      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 }
        );
      }

      const body = await req.json();

      const response = await httpClient.request({
        url: `${EX_COUPONS_URL}/create`,
        method: "POST",
        data: body,
        headers: {
          Authorization: authorization,
        },
      });

      return createSuccessResponse(response, 201);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
          error.message ??
          "Failed to create coupon",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET", "POST"] }
);