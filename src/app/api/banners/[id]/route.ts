import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_BANNERS_URL } from "@/constants/apis";
import { BannerResponse } from "@/domain/shared/types/banner.type";
import { NextRequest } from "next/server";

export const GET = apiHandler(
  async (_: NextRequest, context) => {
    try {
      const id = context.params?.id;

      if (!id) {
        throw new Error("Product id is required");
      }

      const response = await httpClient.get<BannerResponse>(
        `${EX_BANNERS_URL}/${id}`
      );

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
          error.message ??
          "Failed to fetch banner",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET"] }
);

export const PUT = apiHandler(
  async (req: NextRequest, context) => {
    try {
      const id = context.params?.id;

      if (!id) {
        throw new Error("Product id is required");
      }
      const body = await req.json();

      const response = await httpClient.put<BannerResponse>(
        `${EX_BANNERS_URL}/${id}`,
        body
      );

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
          error.message ??
          "Failed to update banner",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["PUT"] }
);

export const DELETE = apiHandler(
  async (_: NextRequest, context) => {
    try {

      const id = context.params?.id;

      if (!id) {
        throw new Error("Product id is required");
      }

      const response = await httpClient.delete<{ message: string }>(
        `${EX_BANNERS_URL}/${id}`
      );

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
          error.message ??
          "Failed to delete banner",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["DELETE"] }
);
