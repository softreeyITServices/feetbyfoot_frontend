// Public blog list — proxies to external GET /blogs only.
import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_BLOGS_URL } from "@/constants/apis";
import { NextRequest } from "next/server";

/* ---------------- GET BLOGS (PUBLIC) ---------------- */
export const GET = apiHandler(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    const query = {
      tag: searchParams.get("tag"),
      isPublished: searchParams.get("isPublished"),
      search: searchParams.get("search"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    };

    const response = await httpClient.request({
      url: EX_BLOGS_URL,
      method: "GET",
      params: query,
      skipAuth: true,
    });

    return createSuccessResponse(response, 200);
  } catch (error: unknown) {
    if (isHttpClientError(error)) {
      throw new ExternalApiError(
        error.data?.message ?? "Failed to fetch blogs",
        error.status,
        error.data
      );
    }
    throw error;
  }
});
