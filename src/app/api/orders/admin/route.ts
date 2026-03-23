import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { ALL_ORDERS_URL } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";

/* ---------------- GET ORDERS ---------------- */
export const GET = apiHandler(
  async (req: NextRequest) => {
    try {
      const authorization = req.headers.get("authorization");

      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 }
        );
      }

      const { searchParams } = new URL(req.url);

      const query = new URLSearchParams();

      const page = searchParams.get("page");
      const perPage = searchParams.get("perPage");
      const paymentStatus = searchParams.get("paymentStatus");
      const orderStatus = searchParams.get("orderStatus");

      if (page) query.append("page", page);
      if (perPage) query.append("perPage", perPage);
      if (paymentStatus) query.append("paymentStatus", paymentStatus);
      if (orderStatus) query.append("orderStatus", orderStatus);

      const response = await httpClient.request({
        url: `${ALL_ORDERS_URL}?${query.toString()}`,
        method: "GET",
        headers: {
          Authorization: authorization,
        },
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ?? error.message ?? "Failed to fetch orders",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET"] }
);