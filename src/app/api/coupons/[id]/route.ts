import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_COUPONS_URL } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";
import { ApiContext } from "@/domain/shared/types/apiResponse.type";

/* ---------------- DELETE COUPON ---------------- */
export const DELETE = apiHandler(
  async (
    req: NextRequest,
    context: ApiContext<unknown>
  ) => {
    try {
      const authorization = req.headers.get("authorization");

      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 }
        );
      }

      const { searchParams } = new URL(req.url);
      const type = searchParams.get("type") || "soft"; // default soft

      const response = await httpClient.request({
        url: `${EX_COUPONS_URL}/${context.params?.id}?type=${type}`,
        method: "DELETE",
        headers: {
          Authorization: authorization,
        },
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
            error.message ??
            "Failed to delete coupon",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["DELETE"] }
);