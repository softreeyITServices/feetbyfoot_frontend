import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_ADMIN_CUSTOMERS_URL } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";
import { ApiContext } from "@/domain/shared/types/apiResponse.type";

export const GET = apiHandler(
  async (req: NextRequest, context: ApiContext<unknown, { customerId: string }>) => {
    try {
      const authorization = req.headers.get("authorization");
      const customerId = context.params?.customerId;

      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 }
        );
      }

      if (!customerId) {
        return NextResponse.json(
          { message: "Missing customerId" },
          { status: 400 }
        );
      }

      const { searchParams } = new URL(req.url);
      const page = searchParams.get("page");
      const limit = searchParams.get("limit");
      const orderStatus = searchParams.get("orderStatus");
      const paymentStatus = searchParams.get("paymentStatus");

      const query = new URLSearchParams();
      if (page) query.append("page", page);
      if (limit) query.append("limit", limit);
      if (orderStatus) query.append("orderStatus", orderStatus);
      if (paymentStatus) query.append("paymentStatus", paymentStatus);

      const url = query.toString()
        ? `${EX_ADMIN_CUSTOMERS_URL}/${customerId}/orders?${query.toString()}`
        : `${EX_ADMIN_CUSTOMERS_URL}/${customerId}/orders`;

      const response = await httpClient.request({
        url,
        method: "GET",
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
            "Failed to fetch customer orders",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET"] }
);

