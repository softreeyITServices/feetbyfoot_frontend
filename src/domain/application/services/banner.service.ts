import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { BANNERS_URL } from "@/constants/apis";
import {
  Banner,
  BannerListResponse,
  BannerResponse,
  CreateBannerPayload,
  UpdateBannerPayload,
} from "@/domain/shared/types/banner.type";

class BannerService {
  async createBanner(payload: CreateBannerPayload): Promise<Banner> {
    try {
      const response = await httpClient.request<BannerResponse>({
        url: `${BANNERS_URL}`,
        method: "POST",
        data: payload,
      });

      if (!response || !response.data) {
        throw new Error("Invalid banner create response");
      }

      return response.data;
    } catch (error) {
      handleApiError(error, "createBanner");
    }
  }

  async getAllBanners(): Promise<Banner[]> {
    try {
      const response = await httpClient.request<BannerListResponse>({
        url: `${BANNERS_URL}`,
        method: "GET",
      });

      if (!response || !response.data) {
        throw new Error("Invalid banner list response");
      }

      const { data } = response.data;
      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid active banner response structure");
      }
      return data;
    } catch (error) {
      handleApiError(error, "getAllBanners");
    }
  }

  async getActiveBanners(): Promise<Banner[]> {
    try {
      const response = await httpClient.request<BannerListResponse>({
        url: `${BANNERS_URL}/active`,
        method: "GET",
        skipAuth: true,
      });

      if (!response || !response.data) {
        throw new Error("Invalid active banner response");
      }

      const { data } = response.data;

      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid active banner response structure");
      }

      return data;
    } catch (error) {
      handleApiError(error, "getActiveBanners");
    }
  }


  async getBannerById(id: string): Promise<Banner> {
    if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("Invalid id");
    }

    try {
      const response = await httpClient.request<BannerResponse>({
        url: `${BANNERS_URL}/${id}`,
        method: "GET",
      });

      if (!response || !response.data) {
        throw new Error("Invalid banner response");
      }

      return response.data;
    } catch (error) {
      handleApiError(error, "getBannerById");
    }
  }

  async updateBanner(
    id: string,
    payload: UpdateBannerPayload
  ): Promise<Banner> {
    if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("Invalid id");
    }

    try {
      const response = await httpClient.request<BannerResponse>({
        url: `${BANNERS_URL}/${id}`,
        method: "PUT",
        data: payload,
      });

      if (!response || !response.data) {
        throw new Error("Invalid banner update response");
      }

      return response.data;
    } catch (error) {
      handleApiError(error, "updateBanner");
    }
  }

  async deleteBanner(id: string): Promise<string> {
    if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("Invalid id");
    }
  
    try {
      const response = await httpClient.request<{
        success: boolean;
        data: { message: string };
      }>({
        url: `${BANNERS_URL}/${id}`,
        method: "DELETE",
      });
  
      if (!response || !response.data?.message) {
        throw new Error("Invalid banner delete response");
      }
  
      return response.data.message;
    } catch (error) {
      handleApiError(error, "deleteBanner");
    }
  }
}

export const bannerService = new BannerService();
