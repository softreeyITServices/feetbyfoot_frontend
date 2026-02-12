// src/app/api/products/route.ts
import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_PRODUCTS_URL } from "@/constants/apis";
import { PublicProductsApiResponse } from "@/domain/shared/types/product.type";
import { NextRequest } from "next/server";

export const GET = apiHandler(
  async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);

      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      const response = await httpClient.get<PublicProductsApiResponse>(
        EX_PRODUCTS_URL,
        params,
        { skipAuth: true }
      );
      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
          error.message ??
          "Failed to fetch products",
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




