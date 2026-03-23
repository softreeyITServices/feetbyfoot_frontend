// src/app/api/blog-comments/admin/[id]/route.ts
import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { EX_ADMIN_BLOG_COMMENTS_URL } from "@/constants/apis";
import { isHttpClientError } from "@/lib/httpClientError";
import { NextRequest } from "next/server";
import { ApiContext } from "@/domain/shared/types/apiResponse.type";

/* ---------------- DELETE COMMENT ---------------- */
export const DELETE = apiHandler(
  async (_req: NextRequest, context: ApiContext<unknown>) => {
    try {
      const response = await httpClient.request({
        url: `${EX_ADMIN_BLOG_COMMENTS_URL}/${context.params?.id}`,
        method: "DELETE",
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ?? "Failed to delete comment",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["DELETE"] }
);