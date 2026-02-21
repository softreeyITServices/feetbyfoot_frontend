// domain/application/services/product.service.ts

import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { PRODUCTS_URL } from "@/constants/apis";
import { Product, ProductByIdResponse, ProductFilterMeta, ProductFilterResponse, PublicProductsApiResponse, PublicProductsResponse } from "@/domain/shared/types/product.type";

class ProductService {
  async getPublicProducts({
    gender,
    page = 1,
    limit = 20,
    categories,
    subcategories,
    sizes,
    colors,
    minDiscount,
    packTypes,
    sortBy,
    isBestseller,
    isNewArrival,
  }: {
    gender?: string[];
    page?: number;
    limit?: number;
    categories?: string[];
    subcategories?: string[];
    sizes?: string[];
    colors?: string[];
    minDiscount?: number;
    packTypes?: boolean[];
    sortBy?: string;
    isBestseller?: boolean;
    isNewArrival?: boolean;
  }): Promise<PublicProductsResponse> {

    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("limit", String(limit));
    if (sortBy) params.append("sortBy", sortBy);
    if (isBestseller) params.append("isBestseller", "true");
    if (isNewArrival) params.append("isNewArrival", "true");
    gender?.forEach((v) => params.append("gender", v));
    categories?.forEach((v) => params.append("categoryIds", v));
    subcategories?.forEach((v) => params.append("categoryTypeIds", v));
    sizes?.forEach((v) => params.append("sizes", v));
    colors?.forEach((v) => params.append("colors", v));
    packTypes?.forEach((v) => params.append("isGiftPack", String(v)));


    if (minDiscount) {
      params.append("minDiscount", String(minDiscount));
    }

    const response = await httpClient.request<PublicProductsApiResponse>({
      url: `${PRODUCTS_URL}?${params.toString()}`, // ✅ FIX
      method: "GET",
      skipAuth: true,
    });

    const data = response.data ?? [];

    if (!data || !Array.isArray(data.products)) {
      throw new Error("Invalid products response");
    }
    return data;
  }


  async getProductFilters(): Promise<ProductFilterMeta> {
    try {
      const response = await httpClient.request<ProductFilterResponse>({
        url: `${PRODUCTS_URL}/filters`,
        method: "GET",
        skipAuth: true,
      });

      if (!response || !response.data) {
        throw new Error("Invalid filter meta response");
      }
      const data = response.data;

      if (!data) {
        throw new Error("Invalid filter meta response");
      }

      return data;
    } catch (error) {
      handleApiError(error, "getProductFilters");
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
