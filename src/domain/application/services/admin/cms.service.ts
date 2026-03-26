// src/domain/application/services/admin/cms.service.ts

import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { CMS_URL } from "@/constants/apis";
import type {
  CmsItem,
  CmsPayload,
} from "@/domain/shared/types/admin/cms";

/* =========================================================
   SERVICE
========================================================= */

export class CmsService {
  private static unwrapCmsData<T>(input: unknown): T | null {
    if (input === null || input === undefined) return null;
    if (Array.isArray(input)) return input as T;
    if (typeof input !== "object") return null;

    const maybe = input as { data?: unknown };
    if ("data" in maybe) {
      return CmsService.unwrapCmsData<T>(maybe.data);
    }

    return input as T;
  }

  /* ---------------- CREATE ---------------- */
  static async create(payload: CmsPayload): Promise<void> {
    try {
      await httpClient.request({
        url: CMS_URL,
        method: "POST",
        data: payload,
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "createCms");
    }
  }

  /* ---------------- GET ALL ---------------- */
  static async getAll(): Promise<CmsItem[]> {
    try {
      const res = await httpClient.request<unknown>({
        url: CMS_URL,
        method: "GET",
      });

      const items = CmsService.unwrapCmsData<CmsItem[]>(res);
      return Array.isArray(items) ? items : [];
    } catch (error) {
      throw handleApiError(error, "getAllCms");
    }
  }

  /* ---------------- GET BY NAME ---------------- */
  static async getByName(name: string): Promise<CmsItem> {
    try {
      const res = await httpClient.request<unknown>({
        url: `${CMS_URL}/by-name/${name}`,
        method: "GET",
      });

      const cms = CmsService.unwrapCmsData<CmsItem>(res);

      if (!cms || typeof cms !== "object" || !("name" in cms)) {
        throw new Error("Invalid CMS response");
      }

      return cms;
    } catch (error) {
      throw handleApiError(error, "getCmsByName");
    }
  }

  /* ---------------- UPDATE ---------------- */
  static async update(id: string, payload: Partial<CmsPayload>): Promise<void> {
    try {
      await httpClient.request({
        url: `${CMS_URL}/${id}`,
        method: "PATCH",
        data: payload,
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "updateCms");
    }
  }

  /* ---------------- DELETE ---------------- */
  static async delete(id: string): Promise<void> {
    try {
      await httpClient.request({
        url: `${CMS_URL}/${id}`,
        method: "DELETE",
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "deleteCms");
    }
  }
}
