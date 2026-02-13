import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_CART_URL } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = apiHandler(
  async (req: NextRequest, context) => {
    try {
      const authorization = req.headers.get("authorization");

      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 },
        );
      }
      const itemId = context.params?.itemId;

      if (!itemId) {
        throw new Error("Missing itemId");
      }

      const body = await req.json();

      const response = await httpClient.request({
        url: `${EX_CART_URL}/items/${itemId}`,
        method: "PATCH",
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
          "Failed to update cart item",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  {
    allowedMethods: ["PATCH"],
  }
);
