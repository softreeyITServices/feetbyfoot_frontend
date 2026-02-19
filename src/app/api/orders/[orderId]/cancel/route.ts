import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_CANCEL_UPDATE_ORDER_URL } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";
import { ApiContext } from "@/domain/shared/types/apiResponse.type";

export const PATCH = apiHandler(
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

      const orderId = context.params?.orderId;

      if (!orderId) {
        return NextResponse.json(
          { message: "Missing orderId" },
          { status: 400 }
        );
      }

      const response = await httpClient.request({
        url: `${EX_CANCEL_UPDATE_ORDER_URL}/${orderId}/cancel`,
        method: "PATCH",
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
            "Failed to cancel order",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["PATCH"] }
);
