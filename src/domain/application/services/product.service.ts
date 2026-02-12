// domain/application/services/product.service.ts

import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { PRODUCTS_URL } from "@/constants/apis";
import { PublicProductsApiResponse, PublicProductsResponse } from "@/domain/shared/types/product.type";

class ProductService {
  async getPublicProducts(
    {
      gender,
      page = 1,
      limit = 20,
    }: {
      gender?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PublicProductsResponse> {
    try {
      const response = await httpClient.request<PublicProductsApiResponse>({
        url: PRODUCTS_URL,
        method: "GET",
        skipAuth: true,
        params: {
          ...(gender && { gender }),
          page,
          limit,
        },
      });
      const data = response.data;

      if (!data || !Array.isArray(data.products)) {
        throw new Error("Invalid products response");
      }

      return data;
    } catch (error) {
      handleApiError(error, "getPublicProducts");
    }
  }
}

export const productService = new ProductService();
