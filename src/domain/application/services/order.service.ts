import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { ALL_ORDERS_URL } from "@/constants/apis";

import {
  PaginatedOrders,
  UpdateOrderStatusRequest,
  ExchangeRequest,
  UpdateOrderStatusResponse,
  ExchangeOrderResponse,
  PaginatedOrdersResponse,
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

  /* ---------------- UPDATE STATUS ---------------- */
  async updateStatus(
    payload: UpdateOrderStatusRequest
  ): Promise<UpdateOrderStatusResponse> {
    try {
      const response =
        await httpClient.request<UpdateOrderStatusResponse>({
          url: `${ALL_ORDERS_URL}/status`,
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

  /* ---------------- EXCHANGE ITEM ---------------- */
  async exchangeItem(
    orderId: string,
    itemId: string,
    payload: ExchangeRequest
  ): Promise<ExchangeOrderResponse> {
    try {
      const response =
        await httpClient.request<ExchangeOrderResponse>({
          url: `${ALL_ORDERS_URL}/${orderId}/items/${itemId}/exchange`,
          method: "POST",
          requiresAuth: true,
          data: payload,
        });

      return response;
    } catch (error) {
      handleApiError(error, "exchangeOrderItem");
      throw error;
    }
  }
}

export const ordersService = new OrdersService();
