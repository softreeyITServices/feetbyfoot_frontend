import { ADMIN_CUSTOMERS_URL } from "@/constants/apis";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { httpClient } from "@/lib/httpClient";
import type {
  CustomerListApiResponse,
  CustomerOrderDetailApiResponse,
  CustomerOrdersApiResponse,
  SingleCustomerApiResponse,
  AdminCustomer
} from "@/domain/shared/types/admin/customer";

type InternalApiResponse<T> = {
  success: boolean;
  data: T;
  timestamp: string;
};

export class CustomerService {
  static async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<AdminCustomer[]> {
    try {
      const response : any = await httpClient.request<any>({
        url: ADMIN_CUSTOMERS_URL,
        method: "GET",
        params,
        requiresAuth: true,
      });

      if (Array.isArray(response)) return response;
      if (response && Array.isArray(response.data)) return response;
      if (response?.data && Array.isArray(response.data.data)) return response;
      
      return [];
    } catch (error) {
      throw handleApiError(error, "getCustomers");
    }
  }

  static async getById(customerId: string): Promise<SingleCustomerApiResponse> {
    try {
      const response = await httpClient.request<
        InternalApiResponse<SingleCustomerApiResponse>
      >({
        url: `${ADMIN_CUSTOMERS_URL}/${customerId}`,
        method: "GET",
        requiresAuth: true,
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error, "getCustomerById");
    }
  }

  static async getOrders(
    customerId: string,
    params?: {
      page?: number;
      limit?: number;
      orderStatus?: string;
      paymentStatus?: string;
    }
  ): Promise<CustomerOrdersApiResponse> {
    try {
      const response : any = await httpClient.request<
        InternalApiResponse<CustomerOrdersApiResponse>
      >({
        url: `${ADMIN_CUSTOMERS_URL}/${customerId}/orders`,
        method: "GET",
        params,
        requiresAuth: true,
      });

      return response;
    } catch (error) {
      throw handleApiError(error, "getCustomerOrders");
    }
  }

  static async getOrderById(
    customerId: string,
    orderId: string
  ): Promise<CustomerOrderDetailApiResponse> {
    try {
      const response = await httpClient.request<
        InternalApiResponse<CustomerOrderDetailApiResponse>
      >({
        url: `${ADMIN_CUSTOMERS_URL}/${customerId}/orders/${orderId}`,
        method: "GET",
        requiresAuth: true,
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error, "getCustomerOrderById");
    }
  }

  static async softDelete(customerId: string): Promise<any> {
    try {
      return await httpClient.request({
        url: `${ADMIN_CUSTOMERS_URL}/${customerId}/soft-delete`,
        method: "PATCH",
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "softDeleteCustomer");
    }
  }

  static async cleanupInactive(): Promise<any> {
    try {
      return await httpClient.request({
        url: `${ADMIN_CUSTOMERS_URL}/cleanup-inactive`,
        method: "POST",
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "cleanupInactiveCustomers");
    }
  }
}

