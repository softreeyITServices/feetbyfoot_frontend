import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_ADDRESS_URL } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";
import {
  Address,
  ApiResponse,
  CreateAddressPayload,
} from "@/domain/shared/types/address.types";

export const GET = apiHandler<ApiResponse<Address[]>>(
  async (req: NextRequest) => {
    try {
      const authorization = req.headers.get("authorization");

      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 },
        );
      }
      const response = await httpClient.request({
        url: EX_ADDRESS_URL,
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
          "Failed to fetch addresses",
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

export const POST = apiHandler(
  async (req: NextRequest) => {
    try {
      const authorization = req.headers.get("authorization");

      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 },
        );
      }
      const body: CreateAddressPayload = await req.json();
      const response = await httpClient.request({
        url: EX_ADDRESS_URL,
        method: "POST",
        data: JSON.stringify(body),
        headers: {
          Authorization: authorization,
        },
      });

      return createSuccessResponse(response, 201);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
          error.message ??
          "Failed to create address",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  {
    allowedMethods: ["POST"],
  }
);
