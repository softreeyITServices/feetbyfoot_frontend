import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_ALL_ORDERS_URL } from "@/constants/apis";
import { NextRequest } from "next/server";

/* ---------------- UPDATE STATUS ---------------- */
export const PATCH = apiHandler(
  async (req: NextRequest) => {
    try {
      const body = await req.json();

      const response = await httpClient.request({
        url: `${EX_ALL_ORDERS_URL}/status`,
        method: "PATCH",
        data: body,
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
            error.message ??
            "Failed to update order status",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["PATCH"] }
);
