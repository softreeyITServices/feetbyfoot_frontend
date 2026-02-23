import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_RATING_URL } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";
import { ApiContext } from "@/domain/shared/types/apiResponse.type";

/* ---------------- GET RATING BY PRODUCT ID (Public) ---------------- */
export const GET = apiHandler(
  async (_req: NextRequest, context: ApiContext<{ id: string }>) => {
    try {
      const id = context.params?.id;

      const response = await httpClient.request({
        url: `${EX_RATING_URL}/${id}`,
        method: "GET",
        skipAuth: true,
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
            error.message ??
            "Failed to fetch ratings",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  {
    allowedMethods: ["GET"],
  }
);

/* ---------------- UPDATE RATING (Auth Required) ---------------- */
export const PATCH = apiHandler(
  async (req: NextRequest, context: ApiContext<{ id: string }>) => {
    try {
      const authorization = req.headers.get("authorization");

      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 }
        );
      }

      const id = context.params?.id;
      const body = await req.json();

      const response = await httpClient.request({
        url: `${EX_RATING_URL}/${id}`,
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
            "Failed to update rating",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  {
    allowedMethods: ["PATCH"],
  }
);