// src/app/api/products/[id]/route.ts

import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { isHttpClientError } from "@/lib/httpClientError";
import { NextRequest } from "next/server";
import { httpClient } from "@/lib/httpClient";
import { EX_PRODUCTS_URL } from "@/constants/apis";
import { PublicProductsApiResponse } from "@/domain/shared/types/product.type";

export const GET = apiHandler(
  async (req: NextRequest, context) => {
    try {
      const id = context.params?.id;

      if (!id) {
        throw new Error("Product id is required");
      }

      const response = await httpClient.get<PublicProductsApiResponse>(
        EX_PRODUCTS_URL + "/"+ id,
        { skipAuth: true }
      );

      return createSuccessResponse(response.data, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
          error.message ??
          "Failed to fetch product",
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
