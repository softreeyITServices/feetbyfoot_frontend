// app/api/v1/categories/[id]/route.ts

import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_CATEGORIES_URL } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";
import { ApiContext } from "@/domain/shared/types/apiResponse.type";

/* ---------------- UPDATE CATEGORY ---------------- */
export const PATCH = apiHandler(
  async (
    req: NextRequest,
    context: ApiContext<unknown>
  ) => {
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
        url: `${EX_CATEGORIES_URL}/${context.params?.id}`,
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
          error.data?.message ??
          error.message ??
          "Failed to update category",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["PATCH"] }
);

/* ---------------- DELETE CATEGORY ---------------- */
export const DELETE = apiHandler(
  async (
    req: NextRequest,
    context: ApiContext<unknown>
  ) => {
    try {
      const authorization = req.headers.get("authorization");

      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 }
        );
      }

      const response = await httpClient.request({
        url: `${EX_CATEGORIES_URL}/${context.params?.id}`,
        method: "DELETE",
        headers: {
          Authorization: authorization,
        },
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
          error.message ??
          "Failed to delete category",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["DELETE"] }
);