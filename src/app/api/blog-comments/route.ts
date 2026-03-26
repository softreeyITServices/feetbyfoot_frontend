// src/app/api/blog-comments/route.ts
import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import {
  EX_ADMIN_BLOG_COMMENTS_URL,
  EX_BLOG_COMMENTS_URL,
} from "@/constants/apis";
import { isHttpClientError } from "@/lib/httpClientError";
import { NextRequest, NextResponse } from "next/server";

/* ---------------- CREATE COMMENT (alias: body includes blogId; prefer POST /api/blogs/[id]/comments) ---------------- */
export const POST = apiHandler(async (req: NextRequest) => {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const blogId = body?.blogId;
    if (typeof blogId !== "string" || !blogId.trim()) {
      return NextResponse.json(
        { message: "Missing or invalid blogId" },
        { status: 400 }
      );
    }

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
      data: {
        blogId: blogId.trim(),
        name,
        email,
        message,
      },
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
});

/* ---------------- GET ADMIN COMMENTS (same proxy as /api/blog-comments/admin; external enforces auth) ---------------- */
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
        Authorization: authorization ?? "",
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