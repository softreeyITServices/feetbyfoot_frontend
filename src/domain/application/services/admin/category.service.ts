import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import type {
  AdminCategory,
  AdminCategoryResponse,
  CategoryPayload,
  CategoryResponse,
} from "@/domain/shared/types/admin/category";
import { ADMIN_CATEGORIES_URL, CATEGORIES_URL } from "@/constants/apis";

/* ================= TYPES ================= */



/* =========================================================
   SERVICE
========================================================= */

export class CategoryService {
  /* ---------------- CREATE ---------------- */
  static async create(payload: CategoryPayload): Promise<void> {
    try {
      await httpClient.request({
        url: CATEGORIES_URL,
        method: "POST",
        data: payload,
        requiresAuth: true, // ✅ works (browser → session)
      });
    } catch (error) {
      throw handleApiError(error, "createCategory");
    }
  }

  /* ---------------- GET ALL ---------------- */
  static async getAll(): Promise<AdminCategory[]> {
    try {
      const res: any = await httpClient.request<
        CategoryResponse<AdminCategoryResponse<AdminCategory[]>>
      >({
        url: ADMIN_CATEGORIES_URL,
        method: "GET",
        requiresAuth: true,
      });
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      if (res?.data && Array.isArray(res.data.data)) return res.data.data;
      return [];
    } catch (error) {
      throw handleApiError(error, "getAllCategories");
    }
  }

  /* ---------------- UPDATE ---------------- */
  static async update(
    id: string,
    payload: CategoryPayload
  ): Promise<void> {
    try {
      await httpClient.request({
        url: `${CATEGORIES_URL}/${id}`,
        method: "PATCH",
        data: payload,
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "updateCategory");
    }
  }

  /* ---------------- DELETE ---------------- */
  static async delete(id: string): Promise<void> {
    try {
      await httpClient.request({
        url: `${CATEGORIES_URL}/${id}`,
        method: "DELETE",
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "deleteCategory");
    }
  }
}