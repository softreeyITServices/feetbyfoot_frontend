import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_PLATFORM_FEES_URL } from "@/constants/apis";
import { NextRequest } from "next/server";

/* ---------------- GET ACTIVE ---------------- */
export const GET = apiHandler(
  async (req: NextRequest) => {
    try {
      const authorization = req.headers.get("authorization");

      const response = await httpClient.request({
        url: `${EX_PLATFORM_FEES_URL}/active`,
        method: "GET",
        headers: {
          Authorization: authorization ?? "",
        },
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
            error.message ??
            "Failed to fetch active platform fees",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET"] }
);
