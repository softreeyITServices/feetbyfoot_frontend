import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";

import type {
  SectionBanner,
  SectionBannerPayload,
  SectionBannerResponse,
} from "@/domain/shared/types/sectionBanner";

import { SECTION_BANNERS_URL } from "@/constants/apis";

export class SectionBannerService {
  private static unwrapData<T>(input: unknown): T {
    if (input && typeof input === "object" && "data" in (input as Record<string, unknown>)) {
      return SectionBannerService.unwrapData<T>((input as { data: unknown }).data);
    }
    return input as T;
  }

  /* ---------------- CREATE ---------------- */
  static async create(payload: SectionBannerPayload): Promise<void> {
    try {
      await httpClient.request({
        url: SECTION_BANNERS_URL,
        method: "POST",
        data: payload,
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "createSectionBanner");
    }
  }

  /* ---------------- ADMIN GET ALL ---------------- */
  static async getAdminAll(): Promise<SectionBanner[]> {
    try {
      const res = await httpClient.request<SectionBannerResponse<SectionBanner[]>>({
        url: `${SECTION_BANNERS_URL}/admin/all`,
        method: "GET",
        requiresAuth: true,
      });

      const data = SectionBannerService.unwrapData<unknown>(res);
      return Array.isArray(data) ? (data as SectionBanner[]) : [];
    } catch (error) {
      throw handleApiError(error, "getAdminSectionBanners");
    }
  }

  /* ---------------- PUBLIC GET ALL ---------------- */
  static async getPublicAll(): Promise<SectionBanner[]> {
    try {
      const res = await httpClient.request<
        SectionBannerResponse<SectionBanner[]>
      >({
        url: `${SECTION_BANNERS_URL}/public/all`,
        method: "GET",
      });

      const data = SectionBannerService.unwrapData<unknown>(res);
      return Array.isArray(data) ? (data as SectionBanner[]) : [];
    } catch (error) {
      throw handleApiError(error, "getPublicSectionBanners");
    }
  }

  /* ---------------- GET BY SECTION KEY ---------------- */
  static async getBySectionKey(
    sectionKey: string
  ): Promise<SectionBanner[]> {
    try {
      const res = await httpClient.request<
        SectionBannerResponse<SectionBanner[]>
      >({
        url: `${SECTION_BANNERS_URL}/public/${sectionKey}`,
        method: "GET",
      });

      const data = SectionBannerService.unwrapData<unknown>(res);
      return Array.isArray(data) ? (data as SectionBanner[]) : [];
    } catch (error) {
      throw handleApiError(error, "getSectionBannerByKey");
    }
  }

  /* ---------------- UPDATE ---------------- */
  static async update(
    id: string,
    payload: Partial<SectionBannerPayload>
  ): Promise<void> {
    try {
      await httpClient.request({
        url: `${SECTION_BANNERS_URL}/${id}`,
        method: "PATCH",
        data: payload,
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "updateSectionBanner");
    }
  }

  /* ---------------- DELETE ---------------- */
  static async delete(id: string): Promise<void> {
    try {
      await httpClient.request({
        url: `${SECTION_BANNERS_URL}/${id}`,
        method: "DELETE",
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "deleteSectionBanner");
    }
  }

  /* ---------------- TOGGLE STATUS ---------------- */
  static async toggleStatus(id: string): Promise<void> {
    try {
      await httpClient.request({
        url: `${SECTION_BANNERS_URL}/${id}/toggle-status`,
        method: "PATCH",
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "toggleSectionBannerStatus");
    }
  }
}