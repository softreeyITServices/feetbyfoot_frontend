import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_PRODUCTS_URL } from "@/constants/apis";
import { ProductFilterMeta } from "@/domain/shared/types/product.type";

export const GET = apiHandler(
  async () => {
    try {
      const response = await httpClient.get<ProductFilterMeta>(
        `${EX_PRODUCTS_URL}/filters/meta`,
        {},
        { skipAuth: true }
      );

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
            error.message ??
            "Failed to fetch filter meta",
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
