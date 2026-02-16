import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_ALL_ORDERS_URL } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";
import { ApiContext } from "@/domain/shared/types/apiResponse.type";

/* ---------------- EXCHANGE ITEM ---------------- */
export const POST = apiHandler(
  async (
    req: NextRequest,
    context: ApiContext<unknown, Record<string, string>>
  ) => {
    try {
      const authorization = req.headers.get("authorization");

      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 }
        );
      }
      const body = await req.json();

      const { orderId, itemId } = context.params ?? {};

      if (!orderId || !itemId) {
        throw new Error("Missing orderId or itemId in params");
      }
      const response = await httpClient.request({
        url: `${EX_ALL_ORDERS_URL}/${orderId}/items/${itemId}/exchange`,
        method: "POST",
        data: body,
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
          "Failed to exchange order item",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["POST"] }
);
