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
        skipAuth: true,
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

/* ---------------- CREATE COMMENT (public → POST collection; GET uses /blog/:id) ---------------- */
export const POST = apiHandler(
  async (req: NextRequest, context: ApiContext<unknown>) => {
    try {
      const blogId = context.params?.id;
      if (!blogId) {
        throw new ExternalApiError("Missing blog id", 400);
      }

      const body = (await req.json()) as Record<string, unknown>;
      const name = body?.name;
      const email = body?.email;
      const message =
        typeof body?.comment === "string"
          ? body.comment
          : typeof body?.message === "string"
            ? body.message
            : "";

      const authorization = req.headers.get("authorization");
      const response = await httpClient.request({
        url: EX_BLOG_COMMENTS_URL,
        method: "POST",
        data: { blogId, name, email, message },
        skipAuth: true,
        ...(authorization
          ? { headers: { Authorization: authorization } }
          : {}),
      });

      return createSuccessResponse(response, 201);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ?? "Failed to add comment",
          error.status,
          error.data
        );
      }
      throw error;
    }
  }
);
