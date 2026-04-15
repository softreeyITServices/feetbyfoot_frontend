import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import {
  ALL_ORDERS_URL,
  EXCHANGE_URL,
  RETURN_URL,
  ADMIN_ORDER_STATUS_URL,
  ADMIN_ORDER_COD_PAYMENT_STATUS_URL,
  ADMIN_RETURN_URL,
  ORDER_ADMIN_DOWNLOAD_PDF_URL,
  orderAdminSingleDownloadPdfUrl,
  orderCustomerDownloadPdfUrl,
  API_BASE_URL,
} from "@/constants/apis";

import {
  PaginatedOrders,
  ExchangeRequestPayload,
  PaginatedOrdersResponse,
  GenericMessageResponse,
  ReturnRequestPayload,
  UpdateOrderStatusRequest,
  UpdateCodPaymentStatusRequest,
  Order,
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

      if (params.page !== undefined) query.append("page", String(params.page));
      if (params.perPage !== undefined)
        query.append("perPage", String(params.perPage));
      if (params.paymentStatus)
        query.append("paymentStatus", params.paymentStatus);
      if (params.orderStatus) query.append("orderStatus", params.orderStatus);

      const queryString = query.toString();

      const response: any = await httpClient.request<PaginatedOrdersResponse>({
        url: queryString ? `${ALL_ORDERS_URL}?${queryString}` : ALL_ORDERS_URL,
        method: "GET",
        requiresAuth: true,
      });

      return response;
    } catch (error) {
      handleApiError(error, "getOrders");
      throw error;
    }
  }

  /* ---------------- EXCHANGE ITEMS ---------------- */
  async exchangeItems(
    payload: ExchangeRequestPayload,
  ): Promise<GenericMessageResponse> {
    try {
      const response = await httpClient.request<GenericMessageResponse>({
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
    payload: ReturnRequestPayload,
  ): Promise<GenericMessageResponse> {
    try {
      const response = await httpClient.request<GenericMessageResponse>({
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
    reason: string,
  ): Promise<GenericMessageResponse> {
    try {
      const response = await httpClient.request<GenericMessageResponse>({
        url: `${API_BASE_URL}/user/orders/${orderId}/cancel`,
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
    addressId: string,
  ): Promise<GenericMessageResponse> {
    try {
      const response = await httpClient.request<GenericMessageResponse>({
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
    payload: UpdateOrderStatusRequest,
  ): Promise<GenericMessageResponse> {
    try {
      const response = await httpClient.request<GenericMessageResponse>({
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

  async updateCodPaymentStatus(
    payload: UpdateCodPaymentStatusRequest,
  ): Promise<{ message: string; data: Order }> {
    try {
      const response = await httpClient.request<{
        data: { message: string; data: Order };
      }>({
        url: ADMIN_ORDER_COD_PAYMENT_STATUS_URL,
        method: "PATCH",
        requiresAuth: true,
        data: payload,
      });

      return response.data;
    } catch (error) {
      handleApiError(error, "updateCodPaymentStatus");
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

      if (params.page !== undefined) query.append("page", String(params.page));
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
      const response = await httpClient.request<GenericMessageResponse>({
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

  private async fetchAuthorizedPdf(url: string): Promise<Blob> {
    const { getSession } = await import("next-auth/react");
    const session = await getSession();
    const accessToken = (session as { accessToken?: string } | null)
      ?.accessToken;

    if (!accessToken) {
      throw new Error("Please sign in to download.");
    }

    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      let message = "Download failed";
      try {
        const j: unknown = await res.json();
        if (
          typeof j === "object" &&
          j !== null &&
          "message" in j &&
          typeof (j as { message: unknown }).message === "string"
        ) {
          message = (j as { message: string }).message;
        }
      } catch {
        message = res.statusText || message;
      }
      throw new Error(message);
    }

    return res.blob();
  }

  private triggerBlobDownload(blob: Blob, filename: string) {
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  /**
   * Customer account: single-order invoice. Backend matches order._id + JWT user (buyer).
   * Will fail for admin tokens — use `downloadAdminSingleOrderInvoicePdf` in admin UI.
   */
  async downloadCustomerInvoicePdf(
    orderMongoId: string,
    orderNumber?: string,
  ): Promise<void> {
    const blob = await this.fetchAuthorizedPdf(
      orderCustomerDownloadPdfUrl(orderMongoId),
    );
    const safe =
      (orderNumber && orderNumber.replace(/[^\w.-]/g, "_")) || "customer-order";
    this.triggerBlobDownload(blob, `${safe}.pdf`);
  }

  /**
   * Admin: single-order invoice PDF. Requires Nest `GET Orders/admin/download-order-pdf/:id`
   * (no buyer userId filter). Adjust `exOrderAdminSingleDownloadPdfUrl` if your path differs.
   */
  async downloadAdminSingleOrderInvoicePdf(
    orderMongoId: string,
    orderNumber?: string,
  ): Promise<void> {
    const blob = await this.fetchAuthorizedPdf(
      orderAdminSingleDownloadPdfUrl(orderMongoId),
    );
    const safe =
      (orderNumber && orderNumber.replace(/[^\w.-]/g, "_")) || "order";
    this.triggerBlobDownload(blob, `${safe}.pdf`);
  }

  /** Admin: PDF summary of all confirmed + paid orders (server-side filter). */
  async downloadAdminPaidOrdersReportPdf(): Promise<void> {
    const blob = await this.fetchAuthorizedPdf(ORDER_ADMIN_DOWNLOAD_PDF_URL);
    this.triggerBlobDownload(blob, "admin-confirmed-paid-orders.pdf");
  }
}

export const ordersService = new OrdersService();
