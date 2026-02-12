// domain/application/services/product.service.ts

import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { PRODUCTS_URL } from "@/constants/apis";
import { Product, ProductByIdResponse, PublicProductsApiResponse, PublicProductsResponse } from "@/domain/shared/types/product.type";

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

  async getProductById(id: string): Promise<Product> {

    if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("Invalid id");
    }
    try {
      const response = await httpClient.request<ProductByIdResponse>({
        url: `${PRODUCTS_URL}/${id}`,
        method: "GET",
        skipAuth: true,
      });

      const data = response.data;

      if (!data) {
        throw new Error("Invalid product response");
      }

      return data;
    } catch (error) {
      handleApiError(error, "getProductById");
    }
  }

}

export const productService = new ProductService();
