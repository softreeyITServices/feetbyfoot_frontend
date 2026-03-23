// src/app/api/admin/exchanges/route.ts

import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_ADMIN_EXCHANGE_URL } from "@/constants/apis";
import { NextRequest } from "next/server";

export const GET = apiHandler(async (req: NextRequest) => {
  try {
    const authorization = req.headers.get("authorization");

    const { searchParams } = new URL(req.url);

    const query = searchParams.toString();

    const response = await httpClient.request({
      url: `${EX_ADMIN_EXCHANGE_URL}?${query}`,
      method: "GET",
      headers: {
        Authorization: authorization || "",
      },
    });

    return createSuccessResponse(response, 200);
  } catch (error) {
    if (isHttpClientError(error)) {
      throw new ExternalApiError(
        error.data?.message || "Failed to fetch exchanges",
        error.status,
        error.data
      );
    }
    throw error;
  }
});