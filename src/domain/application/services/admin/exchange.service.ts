// services/exchange.service.ts

import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { ADMIN_EXCHANGES_URL, API_BASE_URL } from "@/constants/apis";

/* ================= TYPES ================= */

export type ExchangeStatus =
  | "REQUESTED"
  | "EXCHANGE_REQUESTED"
  | "EXCHANGE_APPROVED"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "EXCHANGED"
  | "REPLACEMENT_SHIPPED"
  | "EXCHANGE_REJECTED"
  | "COMPLETED";

export type ExchangeDetails = {
  _id: string;
  exchangeId: string;
  oldSize: string;
  newSize: string;
  oldColor?: string;
  newColor?: string;
  quantity: number;
  reason: string;
  status: string;
  requestedAt: string;
  originalItemId: string;
  pickupAwb?: string;
  replacementAwb?: string;
};

export type ExchangeItemInfo = {
  _id: string;
  productId?: string;
  productName: string;
  productImage: string;
  productSlug?: string;
  size: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  status: string;
  waybill?: string;
  packageStatus?: string;
};

export type ExchangeEntry = {
  details: ExchangeDetails;
  newItem: ExchangeItemInfo;
  oldItem: ExchangeItemInfo;
};

export type ExchangeOrder = {
  _id: string;
  customerName: string;
  orderId: string;
  orderNumber: string;
  exchanges: ExchangeEntry[];
};

export type ExchangeListResponse = {
  data: ExchangeOrder[];
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
};

/* keep Exchange as a legacy alias so other imports don't break */
export type Exchange = ExchangeOrder;

/* =========================================================
   SERVICE
========================================================= */

/**
 * Approving an exchange also books a courier pickup. The approval is a business
 * decision and stands even when the courier call fails — but a silent failure
 * means no pickup is ever scheduled and nobody finds out, so the backend now
 * reports it and the UI has to show it.
 */
export interface ExchangeActionResult {
  message: string;
  pickupScheduled?: boolean;
  pickupAwb?: string | null;
  pickupError?: string | null;
}

export class ExchangeService {
  /* ---------------- GET ALL ---------------- */
  static async getAll(
    params?: Record<string, string | number | undefined>
  ): Promise<ExchangeListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, String(value));
          }
        });
      }
      const query = queryParams.toString() ? "?" + queryParams.toString() : "";

      const res = await httpClient.request<ExchangeListResponse>({
        url: `${ADMIN_EXCHANGES_URL}${query}`,
        method: "GET",
        requiresAuth: true,
      });

      return res;
    } catch (error) {
      throw handleApiError(error, "getExchanges");
    }
  }

  /* ---------------- EXCHANGE ACTION ---------------- */
  static async exchangeAction(
    orderId: string,
    payload: { itemId: string; action: string; reason?: string }
  ): Promise<ExchangeActionResult> {
    try {
      return await httpClient.request<ExchangeActionResult>({
        url: `${API_BASE_URL}/Admin/${orderId}/exchange-action`,
        method: "POST",
        data: payload,
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "exchangeAction");
    }
  }

  /* ---------------- GET BY ID ---------------- */
  static async getById(id: string): Promise<Exchange> {
    try {
      const res = await httpClient.request<ApiResponse<Exchange>>({
        url: `${ADMIN_EXCHANGES_URL}/${id}`,
        method: "GET",
        requiresAuth: true,
      });

      return res.data;
    } catch (error) {
      throw handleApiError(error, "getExchangeById");
    }
  }

  /* ---------------- APPROVE ---------------- */
  static async approve(
    id: string,
    adminNotes: string
  ): Promise<void> {
    try {
      await httpClient.request({
        url: `${API_BASE_URL}/admin/exchanges/${id}/approve`,
        method: "PATCH",
        data: { adminNotes },
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "approveExchange");
    }
  }

  /* ---------------- REJECT ---------------- */
  static async reject(
    id: string,
    rejectReason: string
  ): Promise<void> {
    try {
      await httpClient.request({
        url: `${API_BASE_URL}/admin/exchanges/${id}/reject`,
        method: "PATCH",
        data: { rejectReason },
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "rejectExchange");
    }
  }

  /* ---------------- PICKUP ---------------- */
  static async pickup(
    id: string,
    payload: { courierName: string; pickupAwb: string }
  ): Promise<void> {
    try {
      await httpClient.request({
        url: `${API_BASE_URL}/admin/exchanges/${id}/pickup`,
        method: "PATCH",
        data: payload,
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "pickupExchange");
    }
  }

  /* ---------------- REPLACEMENT ---------------- */
  static async replacement(
    id: string,
    payload: { courierName: string; replacementAwb: string }
  ): Promise<void> {
    try {
      await httpClient.request({
        url: `${API_BASE_URL}/admin/exchanges/${id}/replacement`,
        method: "PATCH",
        data: payload,
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "replacementExchange");
    }
  }

  /* ---------------- SHIP REPLACEMENT ---------------- */
  static async shipReplacement(id: string): Promise<void> {
    try {
      await httpClient.request({
        url: `${API_BASE_URL}/admin/exchanges/${id}/ship-replacement`,
        method: "PATCH",
        data: {},
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "shipReplacement");
    }
  }

  /* ---------------- STATUS UPDATE ---------------- */
  static async updateStatus(
    id: string,
    payload: { status: ExchangeStatus; adminNotes?: string }
  ): Promise<void> {
    try {
      await httpClient.request({
        url: `${API_BASE_URL}/admin/exchanges/${id}/status`,
        method: "PATCH",
        data: payload,
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "updateExchangeStatus");
    }
  }

  /* ---------------- UPDATE ITEM STATUS (PACKED / SHIPPED / DELIVERED) ---------------- */
  static async updateItemStatus(
    orderId: string,
    itemId: string,
    status: "PACKED" | "SHIPPED" | "DELIVERED" | "EXCHANGE_RECEIVED"
  ): Promise<void> {
    try {
      await httpClient.request({
        url: `${API_BASE_URL}/Orders/status`,
        method: "PATCH",
        data: {
          status,
          items: [{ orderId, itemId: [itemId] }],
        },
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "updateItemStatus");
    }
  }

  /* ---------------- COMPLETE EXCHANGE ---------------- */
  static async completeExchange(
    orderId: string,
    itemId: string
  ): Promise<void> {
    try {
      await httpClient.request({
        url: `${API_BASE_URL}/Admin/${orderId}/exchange-complete/${itemId}`,
        method: "POST",
        data: {},
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "completeExchange");
    }
  }
}