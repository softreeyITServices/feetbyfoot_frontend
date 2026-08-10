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
  static async getOverview(
    startDate?: string,
    endDate?: string,
  ): Promise<AdminDashboardOverviewResponse> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const queryString = params.toString() ? `?${params.toString()}` : "";

      const response: any = await httpClient.request<
        InternalApiResponse<AdminDashboardOverviewResponse>
      >({
        url: `${ADMIN_DASHBOARD_OVERVIEW_URL}${queryString}`,
        method: "GET",
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      throw handleApiError(error, "getDashboardOverview");
    }
  }
}
