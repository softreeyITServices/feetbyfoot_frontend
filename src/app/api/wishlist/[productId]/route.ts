import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_WISHLIST_URL } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";
import { ApiContext } from "@/domain/shared/types/apiResponse.type";

/* ---------------- REMOVE FROM WISHLIST ---------------- */
export const DELETE = apiHandler(
  async (
    req: NextRequest,
    context: ApiContext<unknown>
  ) => {
    try {
      const authorization = req.headers.get("authorization");

      if (!authorization) {
          return NextResponse.json(
          JSON.stringify({ message: "Missing Authorization header" }),
          { status: 401 }
        );
      }

      const productId = context.params?.productId

      const response = await httpClient.request({
        url: `${EX_WISHLIST_URL}/${productId}`,
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
            "Failed to remove wishlist product",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  {
    allowedMethods: ["DELETE"],
  }
);
