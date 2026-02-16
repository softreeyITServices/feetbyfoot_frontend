import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_ALL_ORDERS_URL } from "@/constants/apis";
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

      const searchParams = req.nextUrl.searchParams;

      const query = searchParams.toString();

      const response = await httpClient.request({
        url: `${EX_ALL_ORDERS_URL}?${query}`,
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
            "Failed to fetch orders",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET"] }
);
