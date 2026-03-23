// src/app/api/blog-comments/admin/[id]/status/route.ts
import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { EX_ADMIN_BLOG_COMMENTS_URL } from "@/constants/apis";
import { isHttpClientError } from "@/lib/httpClientError";
import { NextRequest, NextResponse } from "next/server";
import { ApiContext } from "@/domain/shared/types/apiResponse.type";

/* ---------------- UPDATE STATUS ---------------- */
export const PATCH = apiHandler(
  async (req: NextRequest, context: ApiContext<unknown>) => {
    try {
      const authorization = req.headers.get("authorization");

      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 }
        );
      }

      const body = await req.json();

      const response = await httpClient.request({
        url: `${EX_ADMIN_BLOG_COMMENTS_URL}/${context.params?.id}/status`,
        method: "PATCH",
        data: body,
        headers: {
          Authorization: authorization,
        },
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ?? "Failed to update comment status",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["PATCH"] }
);