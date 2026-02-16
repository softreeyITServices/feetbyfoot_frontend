import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_PLATFORM_FEES_URL } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";

/* ---------------- GET ALL ---------------- */
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

      const response = await httpClient.request({
        url: EX_PLATFORM_FEES_URL,
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
            "Failed to fetch platform fees",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET", "POST"] }
);

/* ---------------- CREATE ---------------- */
export const POST = apiHandler(
  async (req: NextRequest) => {
    try {
      const body = await req.json();

      const response = await httpClient.request({
        url: EX_PLATFORM_FEES_URL,
        method: "POST",
        data: body,
      });

      return createSuccessResponse(response, 201);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
            error.message ??
            "Failed to create platform fee",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["POST"] }
);
