// src/app/api/v1/cms/route.ts

import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_CMS_URL } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";

/* ---------------- CREATE CMS ---------------- */
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

      const body = await req.json();

      const response = await httpClient.request({
        url: EX_CMS_URL,
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
          error.data?.message ?? "Failed to create CMS",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["POST"] }
);

/* ---------------- GET ALL CMS ---------------- */
export const GET = apiHandler(
  async (req: NextRequest) => {
    try {
      const response = await httpClient.request({
        url: EX_CMS_URL,
        method: "GET",
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ?? "Failed to fetch CMS",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET"] }
);