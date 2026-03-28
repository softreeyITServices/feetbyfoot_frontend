import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";

import type {
  SectionBanner,
  SectionBannerPayload,
  SectionBannerResponse,
} from "@/domain/shared/types/sectionBanner";

import { EX_SECTION_BANNERS_URL, SECTION_BANNERS_URL } from "@/constants/apis";

export class SectionBannerService {
  /**
   * Browser: same-origin `/api` proxy. Server (RSC / route handlers): call backend
   * directly so we never rely on HTTP loopback to the Next dev server.
   */
  private static publicBannersBaseUrl(): string {
    if (typeof window === "undefined" && process.env.API_URL) {
      return EX_SECTION_BANNERS_URL;
    }
    return SECTION_BANNERS_URL;
  }

  private static unwrapData<T>(input: unknown): T {
    if (input && typeof input === "object" && "data" in (input as Record<string, unknown>)) {
      return SectionBannerService.unwrapData<T>((input as { data: unknown }).data);
    }
    return input as T;
  }

  /** Backend may return one banner or an array for GET .../public/:key */
  private static normalizeSectionBannerList(raw: unknown): SectionBanner[] {
    if (Array.isArray(raw)) {
      return raw as SectionBanner[];
    }
    if (
      raw &&
      typeof raw === "object" &&
      "image" in raw &&
      typeof (raw as SectionBanner).image === "string"
    ) {
      return [raw as SectionBanner];
    }
    return [];
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
      const base = SectionBannerService.publicBannersBaseUrl();
      const res = await httpClient.request<
        SectionBannerResponse<SectionBanner[]>
      >({
        url: `${base}/public/all`,
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
      const base = SectionBannerService.publicBannersBaseUrl();
      const res = await httpClient.request<
        SectionBannerResponse<SectionBanner[]>
      >({
        url: `${base}/public/${sectionKey}`,
        method: "GET",
      });

      const data = SectionBannerService.unwrapData<unknown>(res);
      return SectionBannerService.normalizeSectionBannerList(data);
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