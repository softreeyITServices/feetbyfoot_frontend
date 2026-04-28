// src/app/api/orders/admin/exchanges/route.ts

import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { NextRequest } from "next/server";

// ✅ Correct backend route — reads from Orders' embedded exchangeRequests.
// The /admin/exchanges route (ExchangesAdminController) reads from a
// separate Exchange collection that is currently empty.
const EX_EXCHANGES_URL =
  (process.env.API_URL ?? "") + "/Admin/order/exchanges";

export const GET = apiHandler(async (req: NextRequest) => {
  try {
    const authorization = req.headers.get("authorization");

    const { searchParams } = new URL(req.url);

    const query = searchParams.toString();

    const response = await httpClient.request({
      url: `${EX_EXCHANGES_URL}?${query}`,
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