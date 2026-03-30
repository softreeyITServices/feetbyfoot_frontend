// services/exchange.service.ts

import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { ADMIN_EXCHANGES_URL } from "@/constants/apis";

/* ================= TYPES ================= */

export type ExchangeStatus =
  | "EXCHANGE_REQUESTED"
  | "EXCHANGE_APPROVED"
  | "REPLACEMENT_SHIPPED";

/* ---------- Nested Types ---------- */

export type ExchangeLine = {
  orderItemId: string;
  productId: string;
  fromSize: string;
  toSize: string;
  quantity: number;
  reason: string;
};

export type Exchange = {
  _id: string;
  exchangeId?: string;
  userId: string;
  orderId: string;
  orderNumber: string;
  lines: ExchangeLine[];
  status: ExchangeStatus;
  notes: string;
  rejectReason: string;
  courierName: string;
  pickupAwb: string;
  replacementAwb: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  replacementShippedAt?: string;
};

/* ---------- API Response Types ---------- */

export type ExchangeListResponse = {
  page: number;
  limit: number;
  total: number;
  data: Exchange[];
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
};

/* =========================================================
   SERVICE
========================================================= */

export class ExchangeService {
  /* ---------------- GET ALL ---------------- */
  static async getAll(
    params?: Record<string, string | number>
  ): Promise<ExchangeListResponse> {
    try {
      const query = params
        ? "?" + new URLSearchParams(params as any).toString()
        : "";

      const res = await httpClient.request<
        ApiResponse<ExchangeListResponse>
      >({
        url: `${ADMIN_EXCHANGES_URL}${query}`,
        method: "GET",
        requiresAuth: true,
      });

      return res.data;
    } catch (error) {
      throw handleApiError(error, "getExchanges");
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
        url: `${ADMIN_EXCHANGES_URL}/${id}/approve`,
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
        url: `${ADMIN_EXCHANGES_URL}/${id}/reject`,
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
        url: `${ADMIN_EXCHANGES_URL}/${id}/pickup`,
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
        url: `${ADMIN_EXCHANGES_URL}/${id}/replacement`,
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
        url: `${ADMIN_EXCHANGES_URL}/${id}/ship-replacement`,
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
        url: `${ADMIN_EXCHANGES_URL}/${id}/status`,
        method: "PATCH",
        data: payload,
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "updateExchangeStatus");
    }
  }
}