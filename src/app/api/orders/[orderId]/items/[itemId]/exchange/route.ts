import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { exOrderItemExchangeUrl } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";
import { ApiContext } from "@/domain/shared/types/apiResponse.type";

export const POST = apiHandler(
  async (req: NextRequest, context: ApiContext<unknown>) => {
    try {
      const authorization = req.headers.get("authorization");

      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 }
        );
      }

      const { orderId, itemId } = (context.params ?? {}) as {
        orderId?: string;
        itemId?: string;
      };

      if (!orderId || !itemId) {
        return NextResponse.json(
          { message: "Missing orderId or itemId" },
          { status: 400 }
        );
      }

      const body = await req.json();

      const response = await httpClient.request({
        url: exOrderItemExchangeUrl(orderId, itemId),
        method: "POST",
        headers: { Authorization: authorization },
        data: JSON.stringify(body),
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ?? error.message ?? "Failed to exchange item",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["POST"] }
);
