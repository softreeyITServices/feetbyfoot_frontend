import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { POPULAR_SEARCHES_PUBLIC_URL } from "@/constants/apis";
import { PopularSearchItem } from "@/domain/shared/types/popularSearch.type";

class PopularSearchService {
  async getPopularSearches(): Promise<PopularSearchItem[]> {
    try {
      const response = await httpClient.request<PopularSearchItem[]>({
        url: POPULAR_SEARCHES_PUBLIC_URL,
        method: "GET",
        skipAuth: true,
      });
      return response ?? [];
    } catch (error) {
      handleApiError(error, "getPopularSearches");
      throw error;
    }
  }
}

export const popularSearchService = new PopularSearchService();

import { POPULAR_SEARCHES_ADMIN_URL } from "@/constants/apis";

export interface PopularSearchAdminItem {
  _id: string;
  label: string;
  href: string;
  imageUrl?: string;
  order?: number;
  isActive: boolean;
}

export class PopularSearchAdminService {
  static async getAll(): Promise<PopularSearchAdminItem[]> {
    const res: any = await httpClient.request<any>({
      url: POPULAR_SEARCHES_ADMIN_URL,
      method: "GET",
      requiresAuth: true,
    });
    return Array.isArray(res) ? res : res?.data ?? [];
  }

  static async create(data: { label: string; href: string; order?: number; imageUrl?: string }) {
    return httpClient.request({
      url: POPULAR_SEARCHES_ADMIN_URL,
      method: "POST",
      requiresAuth: true,
      data,
    });
  }

  static async update(id: string, data: Partial<PopularSearchAdminItem>) {
    return httpClient.request({
      url: `${POPULAR_SEARCHES_ADMIN_URL}/${id}`,
      method: "PATCH",
      requiresAuth: true,
      data,
    });
  }

  static async remove(id: string) {
    return httpClient.request({
      url: `${POPULAR_SEARCHES_ADMIN_URL}/${id}`,
      method: "DELETE",
      requiresAuth: true,
    });
  }
}
