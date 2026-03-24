import { ADMIN_CUSTOMERS_URL } from "@/constants/apis";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { httpClient } from "@/lib/httpClient";
import type {
  CustomerListApiResponse,
  CustomerOrderDetailApiResponse,
  CustomerOrdersApiResponse,
  SingleCustomerApiResponse,
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
  }): Promise<CustomerListApiResponse> {
    try {
      const response = await httpClient.request<
        InternalApiResponse<CustomerListApiResponse>
      >({
        url: ADMIN_CUSTOMERS_URL,
        method: "GET",
        params,
        requiresAuth: true,
      });

      return response.data;
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
      const response = await httpClient.request<
        InternalApiResponse<CustomerOrdersApiResponse>
      >({
        url: `${ADMIN_CUSTOMERS_URL}/${customerId}/orders`,
        method: "GET",
        params,
        requiresAuth: true,
      });

      return response.data;
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
}

