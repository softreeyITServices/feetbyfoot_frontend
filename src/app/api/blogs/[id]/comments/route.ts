// src/app/api/blogs/[id]/comments/route.ts
import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { EX_BLOG_COMMENTS_URL } from "@/constants/apis";
import { isHttpClientError } from "@/lib/httpClientError";
import { NextRequest } from "next/server";
import { ApiContext } from "@/domain/shared/types/apiResponse.type";

/* ---------------- GET COMMENTS BY BLOG ---------------- */
export const GET = apiHandler(
  async (_req: NextRequest, context: ApiContext<unknown>) => {
    try {
      const response = await httpClient.request({
        url: `${EX_BLOG_COMMENTS_URL}/blog/${context.params?.id}`,
        method: "GET",
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ?? "Failed to fetch comments",
          error.status,
          error.data
        );
      }
      throw error;
    }
  }
);
