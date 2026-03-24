import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_ADMIN_CUSTOMERS_URL } from "@/constants/apis";
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

      const { searchParams } = new URL(req.url);
      const page = searchParams.get("page");
      const limit = searchParams.get("limit");
      const search = searchParams.get("search");

      const query = new URLSearchParams();
      if (page) query.append("page", page);
      if (limit) query.append("limit", limit);
      if (search) query.append("search", search);

      const url = query.toString()
        ? `${EX_ADMIN_CUSTOMERS_URL}?${query.toString()}`
        : EX_ADMIN_CUSTOMERS_URL;

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
          error.data?.message ?? error.message ?? "Failed to fetch customers",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET"] }
);

