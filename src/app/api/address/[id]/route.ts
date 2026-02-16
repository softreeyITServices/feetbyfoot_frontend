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
  CreateAddressPayload,
  ApiResponse,
} from "@/domain/shared/types/address.types";

export const GET = apiHandler(
  async (_req: NextRequest, context) => {
    const authorization = _req.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Missing Authorization header" },
        { status: 401 },
      );
    }
    const id = context.params?.id;

    if (!id) {
      throw new ExternalApiError("Address id is required", 400);
    }

    try {
      const response = await httpClient.request<ApiResponse<Address>>({
        url: `${EX_ADDRESS_URL}/${id}`,
        method: "GET",
        headers: {
          Authorization: authorization,
        }
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
          error.message ??
          "Failed to fetch address",
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

export const PATCH = apiHandler(
  async (req: NextRequest, context) => {
    const authorization = req.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Missing Authorization header" },
        { status: 401 },
      );
    }
    const id = context.params?.id;

    if (!id) {
      throw new ExternalApiError("Address id is required", 400);
    }
    try {
      const body: Partial<CreateAddressPayload> = await req.json();

      const response = await httpClient.request<ApiResponse<Address>>({
        url: `${EX_ADDRESS_URL}/${id}`,
        method: "PATCH",
        data: JSON.stringify(body),
        headers: {
          Authorization: authorization,
        }
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
          error.message ??
          "Failed to update address",
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

export const DELETE = apiHandler(
  async (_req: NextRequest, context) => {
    const authorization = _req.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Missing Authorization header" },
        { status: 401 },
      );
    }
    const id = context.params?.id;

    if (!id) {
      throw new ExternalApiError("Address id is required", 400);
    }
    try {
      const response = await httpClient.request<ApiResponse<null>>({
        url: `${EX_ADDRESS_URL}/${id}`,
        method: "DELETE",
        headers: {
          Authorization: authorization,
        }
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
          error.message ??
          "Failed to delete address",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  {
    allowedMethods: ["DELETE"],
  }
);
