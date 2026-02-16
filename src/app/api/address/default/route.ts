import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_ADDRESS_URL } from "@/constants/apis";
import { ApiResponse, Address } from "@/domain/shared/types/address.types";
import { NextRequest, NextResponse } from "next/server";

export const GET = apiHandler(
  async (req: NextRequest) => {
    const authorization = req.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Missing Authorization header" },
        { status: 401 },
      );
    }
    try {
      const response = await httpClient.request<ApiResponse<Address>>({
        url: `${EX_ADDRESS_URL}/default`,
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
          "Failed to fetch default address",
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
