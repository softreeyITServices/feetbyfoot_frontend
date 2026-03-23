// src/app/api/blog-comments/admin/route.ts
import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { EX_ADMIN_BLOG_COMMENTS_URL } from "@/constants/apis";
import { isHttpClientError } from "@/lib/httpClientError";
import { NextRequest } from "next/server";

/* ---------------- GET ADMIN COMMENTS ---------------- */
export const GET = apiHandler(async (req: NextRequest) => {
  try {
    const authorization = req.headers.get("authorization");

    const { searchParams } = new URL(req.url);

    const query = {
      search: searchParams.get("search"),
      blogId: searchParams.get("blogId"),
      status: searchParams.get("status"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    };

    const response = await httpClient.request({
      url: EX_ADMIN_BLOG_COMMENTS_URL,
      method: "GET",
      params: query,
      headers: {
        Authorization: authorization || "",
      },
    });

    return createSuccessResponse(response, 200);
  } catch (error: unknown) {
    if (isHttpClientError(error)) {
      throw new ExternalApiError(
        error.data?.message ?? "Failed to fetch admin comments",
        error.status,
        error.data
      );
    }
    throw error;
  }
});