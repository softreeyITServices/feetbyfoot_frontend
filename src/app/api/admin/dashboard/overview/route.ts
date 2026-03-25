import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_ADMIN_DASHBOARD_OVERVIEW_URL } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";

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

      const response = await httpClient.request({
        url: EX_ADMIN_DASHBOARD_OVERVIEW_URL,
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
            "Failed to fetch dashboard overview",
          error.status,
          error.data
        );
      }

      throw error;
    }
  },
  { allowedMethods: ["GET"] }
);

