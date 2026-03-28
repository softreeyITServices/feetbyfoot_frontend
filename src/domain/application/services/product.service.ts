// domain/application/services/product.service.ts

import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import {
  PRODUCTS_MENUS_URL,
  PRODUCTS_PUBLIC_MEGA_MENU_URL,
  PRODUCTS_URL,
  EX_PRODUCTS_URL,
  productsMenuByIdUrl,
  productsPublicMegaMenuByIdUrl,
} from "@/constants/apis";
import {
  CreateMegaMenuBody,
  CreateProductPayload,
  MegaMenuApiResponse,
  MegaMenuDocument,
  MegaMenuListItem,
  ProductByIdData,
  ProductByIdResponse,
  ProductFilterMeta,
  ProductFilterResponse,
  PublicProductsApiResponse,
  PublicProductsResponse,
  UpdateMegaMenuBody,
  UpdateProductPayload,
} from "@/domain/shared/types/product.type";

function unwrapNextData<T = unknown>(input: unknown): unknown {
  if (
    input &&
    typeof input === "object" &&
    "data" in input &&
    "success" in input
  ) {
    return (input as { data: T }).data;
  }
  return input;
}

function extractMegaMenuDocument(input: unknown): MegaMenuDocument | null {
  const withGroups = (v: unknown): MegaMenuDocument | null => {
    if (!v || typeof v !== "object") return null;
    const o = v as Record<string, unknown>;
    return Array.isArray(o.groups) ? (v as MegaMenuDocument) : null;
  };

  let cursor: unknown = unwrapNextData(input);

  let found = withGroups(cursor);
  if (found) return found;

  if (cursor && typeof cursor === "object" && "data" in cursor) {
    found = withGroups((cursor as MegaMenuApiResponse).data);
    if (found) return found;
  }

  return withGroups(input);
}

function extractMegaMenuList(input: unknown): MegaMenuListItem[] | null {
  const raw = unwrapNextData<unknown>(input);
  return Array.isArray(raw) ? (raw as MegaMenuListItem[]) : null;
}

class ProductService {
  async getPublicProducts({
    gender,
    page = 1,
    limit = 20,
    search,
    categories,
    subcategories,
    sizes,
    colors,
    minDiscount,
    packTypes,
    sortBy,
    isBestseller,
    isNewArrival,
    includeInactive,
  }: {
    gender?: string[];
    page?: number;
    limit?: number;
    search?: string;
    categories?: string[];
    subcategories?: string[];
    sizes?: string[];
    colors?: string[];
    minDiscount?: number;
    packTypes?: boolean[];
    sortBy?: string;
    isBestseller?: boolean;
    isNewArrival?: boolean;
    includeInactive?: boolean;
  }): Promise<PublicProductsResponse> {

    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("limit", String(limit));
    if (search?.trim()) params.append("search", search.trim());
    if (sortBy) params.append("sortBy", sortBy);
    if (isBestseller) params.append("isBestseller", "true");
    if (isNewArrival) params.append("isNewArrival", "true");
    if (includeInactive) params.append("includeInactive", "true");
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
      url: `${EX_PRODUCTS_URL}/public?${params.toString()}`, // ✅ FIX
      method: "GET",
      skipAuth: true,
    });

    const data = response ?? {};

    if (!data || !Array.isArray((data as any).products)) {
      throw new Error("Invalid products response");
    }
    return data as any;
  }


  /**
   * Public default mega menu (`GET .../products/public/mega-menu`).
   */
  async getMegaMenu(): Promise<MegaMenuDocument> {
    try {
      const raw = await httpClient.request<unknown>({
        url: PRODUCTS_PUBLIC_MEGA_MENU_URL,
        method: "GET",
        skipAuth: true,
      });

      const doc = extractMegaMenuDocument(raw);
      if (doc) return doc;

      throw new Error("Invalid mega menu response");
    } catch (error) {
      throw handleApiError(error, "getMegaMenu");
    }
  }

  /**
   * Public mega menu by id (`GET .../products/public/mega-menu/:menuId`).
   */
  async getMegaMenuById(menuId: string): Promise<MegaMenuDocument> {
    try {
      const raw = await httpClient.request<unknown>({
        url: productsPublicMegaMenuByIdUrl(menuId),
        method: "GET",
        skipAuth: true,
      });

      const doc = extractMegaMenuDocument(raw);
      if (doc) return doc;

      throw new Error("Invalid mega menu response");
    } catch (error) {
      throw handleApiError(error, "getMegaMenuById");
    }
  }

  /** Admin: `GET .../products/menus` */
  async listMegaMenus(): Promise<MegaMenuListItem[]> {
    try {
      const raw = await httpClient.request<unknown>({
        url: PRODUCTS_MENUS_URL,
        method: "GET",
        requiresAuth: true,
      });

      const list = extractMegaMenuList(raw);
      if (list) return list;

      throw new Error("Invalid menus list response");
    } catch (error) {
      throw handleApiError(error, "listMegaMenus");
    }
  }

  /** Admin: `GET .../products/menus/:menuId` */
  async getAdminMegaMenu(menuId: string): Promise<MegaMenuDocument> {
    try {
      const raw = await httpClient.request<unknown>({
        url: productsMenuByIdUrl(menuId),
        method: "GET",
        requiresAuth: true,
      });

      const doc = extractMegaMenuDocument(raw);
      if (doc) return doc;

      throw new Error("Invalid mega menu response");
    } catch (error) {
      throw handleApiError(error, "getAdminMegaMenu");
    }
  }

  /** Admin: `POST .../products/menus` */
  async createMegaMenu(body: CreateMegaMenuBody): Promise<MegaMenuDocument> {
    try {
      const raw = await httpClient.request<unknown>({
        url: PRODUCTS_MENUS_URL,
        method: "POST",
        data: body,
        requiresAuth: true,
      });

      const doc = extractMegaMenuDocument(raw);
      if (doc) return doc;

      throw new Error("Invalid mega menu create response");
    } catch (error) {
      throw handleApiError(error, "createMegaMenu");
    }
  }

  /** Admin: `PATCH .../products/menus/:menuId` */
  async updateMegaMenu(
    menuId: string,
    body: UpdateMegaMenuBody
  ): Promise<MegaMenuDocument> {
    try {
      const raw = await httpClient.request<unknown>({
        url: productsMenuByIdUrl(menuId),
        method: "PATCH",
        data: body,
        requiresAuth: true,
      });

      const doc = extractMegaMenuDocument(raw);
      if (doc) return doc;

      throw new Error("Invalid mega menu update response");
    } catch (error) {
      throw handleApiError(error, "updateMegaMenu");
    }
  }

  async getProductFilters(): Promise<ProductFilterMeta> {
    try {
      const response = await httpClient.request<ProductFilterResponse>({
        url: `${EX_PRODUCTS_URL}/filters/meta`,
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

      return data as any;
    } catch (error) {
      handleApiError(error, "getProductFilters");
    }
  }


  async getProductById(id: string): Promise<ProductByIdData> {

    if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("Invalid id");
    }
    try {
      const response = await httpClient.request<ProductByIdResponse>({
        url: `${EX_PRODUCTS_URL}/${id}`,
        method: "GET",
        skipAuth: true,
      });

      const data = response.data;

      if (!data) {
        throw new Error("Invalid product response");
      }
      const [firstProduct] = data;
      return firstProduct;

    } catch (error) {
      handleApiError(error, "getProductById");
    }
  }

  async update(id: string, payload: UpdateProductPayload) {
    try {
      await httpClient.request({
        url: `${EX_PRODUCTS_URL}/${id}`,
        method: "PATCH",
        data: payload,
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "updateProduct");
    }
  }

  async delete(id: string) {
    try {
      await httpClient.request({
        url: `${EX_PRODUCTS_URL}/${id}`,
        method: "DELETE",
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "deleteProduct");
    }
  }

  async create(payload: CreateProductPayload): Promise<void> {
    try {
      await httpClient.request({
        url: EX_PRODUCTS_URL,
        method: "POST",
        data: payload,
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "createProduct");
    }
  }
}

export const productService = new ProductService();
