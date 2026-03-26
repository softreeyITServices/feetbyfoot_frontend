// Public blog by id/slug — read-only; admin mutations live under /api/admin/blogs/[id].
import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_BLOGS_URL } from "@/constants/apis";
import { NextRequest } from "next/server";
import { ApiContext } from "@/domain/shared/types/apiResponse.type";

/* ---------------- GET BLOG BY ID (PUBLIC) ---------------- */
export const GET = apiHandler(
  async (_req: NextRequest, context: ApiContext<unknown>) => {
    try {
      const response = await httpClient.request({
        url: `${EX_BLOGS_URL}/${context.params?.id}`,
        method: "GET",
        skipAuth: true,
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ?? "Failed to fetch blog",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET"] }
);
