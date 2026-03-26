import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_ADMIN_BLOGS_URL } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";

/* ---------------- LIST BLOGS (ADMIN) ---------------- */
export const GET = apiHandler(
  async (req: NextRequest) => {
    try {
      const authorization = req.headers.get("authorization");

      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 }
        );
      }

      const { searchParams } = new URL(req.url);

      const query = {
        tag: searchParams.get("tag"),
        isPublished: searchParams.get("isPublished"),
        search: searchParams.get("search"),
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
      };

      const response = await httpClient.request({
        url: EX_ADMIN_BLOGS_URL,
        method: "GET",
        params: query,
        headers: {
          Authorization: authorization,
        },
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
  },
  { allowedMethods: ["GET"] }
);

/* ---------------- CREATE BLOG (ADMIN) ---------------- */
export const POST = apiHandler(
  async (req: NextRequest) => {
    try {
      const authorization = req.headers.get("authorization");

      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 }
        );
      }

      const body = (await req.json()) as Record<string, unknown>;

      const response = await httpClient.request({
        url: EX_ADMIN_BLOGS_URL,
        method: "POST",
        data: body,
        headers: {
          Authorization: authorization,
        },
      });

      return createSuccessResponse(response, 201);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ?? "Failed to create blog",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["POST"] }
);
