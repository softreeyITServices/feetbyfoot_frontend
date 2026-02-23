import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { ALL_ORDERS_URL, EXCHANGE_URL, RETURN_URL } from "@/constants/apis";

import {
  PaginatedOrders,
  ExchangeRequestPayload,
  PaginatedOrdersResponse,
  GenericMessageResponse,
  ReturnRequestPayload,
} from "@/domain/shared/types/order.type";

class OrdersService {
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

      const response = await httpClient.request<PaginatedOrdersResponse>({
        url: `${ALL_ORDERS_URL}?${query.toString()}`,
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
          requiresAuth: true,
          data: { addressId },
        });

      return response;
    } catch (error) {
      handleApiError(error, "updateOrderAddress");
    }
  }
}

export const ordersService = new OrdersService();
