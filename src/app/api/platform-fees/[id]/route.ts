import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { NextRequest, NextResponse } from "next/server";
import { EX_PLATFORM_FEES_URL } from "@/constants/apis";
import { ApiContext } from "@/domain/shared/types/apiResponse.type";

/* ---------------- GET BY ID ---------------- */
export const GET = apiHandler(
  async (req: NextRequest, context: ApiContext<unknown>) => {
    try {
      const authorization = req.headers.get("authorization");

      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 }
        );
      }

      const response = await httpClient.request({
        url: `${EX_PLATFORM_FEES_URL}/${context.params?.id}`,
        method: "GET",
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
            "Failed to fetch platform fee",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET"] }
);

/* ---------------- UPDATE ---------------- */
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
        url: `${EX_PLATFORM_FEES_URL}/${context.params?.id}`,
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
            "Failed to update platform fee",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["PATCH"] }
);

/* ---------------- DELETE ---------------- */
export const DELETE = apiHandler(
  async (req: NextRequest, context: ApiContext<unknown>) => {
    try {
      const authorization = req.headers.get("authorization");

      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 }
        );
      }

      // Optional: support hard/soft delete like coupons
      const { searchParams } = new URL(req.url);
      const type = searchParams.get("type") || "soft";

      const response = await httpClient.request({
        url: `${EX_PLATFORM_FEES_URL}/${context.params?.id}?type=${type}`,
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
            "Failed to delete platform fee",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["DELETE"] }
);