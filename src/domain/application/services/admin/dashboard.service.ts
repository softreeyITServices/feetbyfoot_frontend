import { ADMIN_DASHBOARD_OVERVIEW_URL } from "@/constants/apis";
import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import type { AdminDashboardOverviewResponse } from "@/domain/shared/types/admin/dashboard";

type InternalApiResponse<T> = {
  success: boolean;
  data: T;
  timestamp: string;
};

export class DashboardService {
  static async getOverview(): Promise<AdminDashboardOverviewResponse> {
    try {
      const response = await httpClient.request<
        InternalApiResponse<AdminDashboardOverviewResponse>
      >({
        url: ADMIN_DASHBOARD_OVERVIEW_URL,
        method: "GET",
        requiresAuth: true,
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error, "getDashboardOverview");
    }
  }
}

