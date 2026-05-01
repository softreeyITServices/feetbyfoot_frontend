import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import type {
  CategoryPayload,
  CategoryResponse,
} from "@/domain/shared/types/admin/category";
import {
  ADMIN_SUB_CATEGORIES_URL,
  SUB_CATEGORIES_URL,
} from "@/constants/apis";

function normalizeCategoryTypeList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];

  if (res && typeof res === "object") {
    const data = (res as { data?: unknown }).data;

    if (Array.isArray(data)) return data as T[];

    if (data && typeof data === "object") {
      const nestedData = (data as { data?: unknown }).data;
      if (Array.isArray(nestedData)) return nestedData as T[];
    }
  }

  return [];
}

export class CategoryTypeService {
  /* ---------------- CREATE ---------------- */
  static async create(payload: CategoryPayload): Promise<void> {
    try {
      await httpClient.request({
        url: SUB_CATEGORIES_URL,
        method: "POST",
        data: payload,
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "createSubcategory");
    }
  }

  /* ---------------- GET ALL ---------------- */
  static async getAll<T>(): Promise<T[]> {
    try {
      const res = await httpClient.request<
        CategoryResponse<{ data: T[] }>
      >({
        url: ADMIN_SUB_CATEGORIES_URL,
        method: "GET",
        requiresAuth: true,
      });

      return normalizeCategoryTypeList<T>(res);
    } catch (error) {
      if ((error as { status?: number })?.status === 404) {
        return [];
      }

      throw handleApiError(error, "getAllSubcategories");
    }
  }

  /* ---------------- GET BY CATEGORY ---------------- */
  static async getByCategory<T>(categoryId: string): Promise<T[]> {
    try {
      const res = await httpClient.request<
        CategoryResponse<{ data: T[] }>
      >({
        url: `${ADMIN_SUB_CATEGORIES_URL}/category/${categoryId}`,
        method: "GET",
        requiresAuth: true,
      });

      return normalizeCategoryTypeList<T>(res);
    } catch (error) {
      if ((error as { status?: number })?.status === 404) {
        return [];
      }

      throw handleApiError(error, "getSubcategoriesByCategory");
    }
  }

  /* ---------------- UPDATE ---------------- */
  static async update(
    id: string,
    payload: CategoryPayload
  ): Promise<void> {
    try {
      await httpClient.request({
        url: `${SUB_CATEGORIES_URL}/${id}`,
        method: "PATCH",
        data: payload,
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "updateSubcategory");
    }
  }

  /* ---------------- DELETE ---------------- */
  static async delete(id: string): Promise<void> {
    try {
      await httpClient.request({
        url: `${SUB_CATEGORIES_URL}/${id}`,
        method: "DELETE",
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "deleteSubcategory");
    }
  }
}
