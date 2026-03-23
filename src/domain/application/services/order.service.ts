import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import {
  ALL_ORDERS_URL,
  EXCHANGE_URL,
  RETURN_URL,
  ADMIN_ORDER_STATUS_URL,
  ADMIN_RETURN_URL,
} from "@/constants/apis";

import {
  PaginatedOrders,
  ExchangeRequestPayload,
  PaginatedOrdersResponse,
  GenericMessageResponse,
  ReturnRequestPayload,
  UpdateOrderStatusRequest,
} from "@/domain/shared/types/order.type";

class OrdersService {
  /* =========================================================
   * USER APIs
   * ======================================================= */

  /* ---------------- GET ORDERS ---------------- */
  async getOrders(params: {
    page?: number;
    perPage?: number;
    paymentStatus?: string;
    orderStatus?: string;
  }): Promise<PaginatedOrders> {
    try {
      const query = new URLSearchParams();

      if (params.page !== undefined)
        query.append("page", String(params.page));
      if (params.perPage !== undefined)
        query.append("perPage", String(params.perPage));
      if (params.paymentStatus)
        query.append("paymentStatus", params.paymentStatus);
      if (params.orderStatus)
        query.append("orderStatus", params.orderStatus);

      const queryString = query.toString();

      const response = await httpClient.request<PaginatedOrdersResponse>({
        url: queryString
          ? `${ALL_ORDERS_URL}?${queryString}`
          : ALL_ORDERS_URL,
        method: "GET",
        requiresAuth: true,
      });

      return response.data;
    } catch (error) {
      handleApiError(error, "getOrders");
      throw error;
    }
  }

  /* ---------------- EXCHANGE ITEMS ---------------- */
  async exchangeItems(
    payload: ExchangeRequestPayload
  ): Promise<GenericMessageResponse> {
    try {
      const response =
        await httpClient.request<GenericMessageResponse>({
          url: EXCHANGE_URL,
          method: "POST",
          requiresAuth: true,
          data: payload,
        });

      return response;
    } catch (error) {
      handleApiError(error, "exchangeItems");
      throw error;
    }
  }

  /* ---------------- RETURN ITEMS ---------------- */
  async returnItems(
    payload: ReturnRequestPayload
  ): Promise<GenericMessageResponse> {
    try {
      const response =
        await httpClient.request<GenericMessageResponse>({
          url: RETURN_URL,
          method: "POST",
          requiresAuth: true,
          data: payload,
        });

      return response;
    } catch (error) {
      handleApiError(error, "returnItems");
      throw error;
    }
  }

  /* ---------------- CANCEL ORDER ---------------- */
  async cancelOrder(
    orderId: string,
    reason: string
  ): Promise<GenericMessageResponse> {
    try {
      const response =
        await httpClient.request<GenericMessageResponse>({
          url: `${ALL_ORDERS_URL}/${orderId}/cancel`,
          method: "PATCH",
          data: { reason },
          requiresAuth: true,
        });

      return response;
    } catch (error) {
      handleApiError(error, "cancelOrder");
      throw error;
    }
  }

  /* ---------------- UPDATE ORDER ADDRESS ---------------- */
  async updateOrderAddress(
    orderId: string,
    addressId: string
  ): Promise<GenericMessageResponse> {
    try {
      const response =
        await httpClient.request<GenericMessageResponse>({
          url: `${ALL_ORDERS_URL}/${orderId}/update`,
          method: "PATCH",
          data: { addressId },
          requiresAuth: true,
        });

      return response;
    } catch (error) {
      handleApiError(error, "updateOrderAddress");
      throw error;
    }
  }

  /* =========================================================
   * ADMIN APIs
   * ======================================================= */

  /* ---------------- UPDATE ORDER STATUS ---------------- */
  async updateOrderStatus(
    payload: UpdateOrderStatusRequest
  ): Promise<GenericMessageResponse> {
    try {
      const response =
        await httpClient.request<GenericMessageResponse>({
          url: ADMIN_ORDER_STATUS_URL,
          method: "PATCH",
          requiresAuth: true,
          data: payload,
        });

      return response;
    } catch (error) {
      handleApiError(error, "updateOrderStatus");
      throw error;
    }
  }

  /* ---------------- GET RETURN ORDERS ---------------- */
  async getReturnOrders(params: {
    page?: number;
    perPage?: number;
    status?: string;
  }): Promise<PaginatedOrders> {
    try {
      const query = new URLSearchParams();

      if (params.page !== undefined)
        query.append("page", String(params.page));
      if (params.perPage !== undefined)
        query.append("perPage", String(params.perPage));
      if (params.status) query.append("status", params.status);

      const queryString = query.toString();

      const response = await httpClient.request<PaginatedOrdersResponse>({
        url: queryString
          ? `${ADMIN_RETURN_URL}?${queryString}`
          : ADMIN_RETURN_URL,
        method: "GET",
        requiresAuth: true,
      });

      return response.data;
    } catch (error) {
      handleApiError(error, "getReturnOrders");
      throw error;
    }
  }

  /* ---------------- UPDATE RETURN STATUS ---------------- */
  async updateReturnStatus(payload: {
    id: string;
    status: string;
  }): Promise<GenericMessageResponse> {
    try {
      const response =
        await httpClient.request<GenericMessageResponse>({
          url: ADMIN_RETURN_URL,
          method: "PATCH",
          requiresAuth: true,
          data: payload,
        });

      return response;
    } catch (error) {
      handleApiError(error, "updateReturnStatus");
      throw error;
    }
  }
}

export const ordersService = new OrdersService();