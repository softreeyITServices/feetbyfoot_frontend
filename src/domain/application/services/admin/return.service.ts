import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import {
  ADMIN_RETURN_URL,
  adminReturnActionUrl,
  adminReturnReceivedUrl,
  adminRefundUrl,
} from "@/constants/apis";

/* ================= TYPES ================= */

export type ReturnStatus =
  | "RETURN_REQUESTED"
  | "RETURN_APPROVED"
  | "RETURN_REJECTED"
  | "RETURN_RECEIVED"
  | "REFUNDED";

export type ReturnItemInfo = {
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
  actionStatus?: string; // Track admin decision per item
  refundAmount?: number; // Store calculated refund per item
  reason?: string; // Fallback reason
  returnRequests?: Array<{
    reason: string;
    status: string;
    requestedAt: string;
  }>;
};

export type ReturnOrder = {
  _id: string;
  customerName: string;
  orderId: string;
  orderNumber: string;
  userId?: any; // Populated user object
  returnStatus: string;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  refundAmount?: number;
  subtotal?: number;
  totalAmount?: number;
  items: ReturnItemInfo[];
  waybill?: string;
  trackingUrl?: string;
  packageStatus?: string;
  createdAt: string;

};

export type ReturnListResponse = {
  data: ReturnOrder[];
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type GenericMessageResponse = {
  success: boolean;
  message: string;
};

/* ================= SERVICE ================= */

export class ReturnService {
  /* ---------------- GET ALL RETURNS ---------------- */
  static async getAll(
    params?: Record<string, string | number>
  ): Promise<ReturnListResponse> {
    try {
      const query = params
        ? "?" + new URLSearchParams(params as Record<string, string>).toString()
        : "";

      const res = await httpClient.request<ReturnListResponse>({
        url: `${ADMIN_RETURN_URL}${query}`,
        method: "GET",
        requiresAuth: true,
      });

      return res;
    } catch (error) {
      throw handleApiError(error, "getReturns");
    }
  }

  /* ---------------- RETURN ACTION (APPROVE/REJECT) ---------------- */
  static async returnAction(
    orderId: string,
    payload: {
      itemIds: string[];
      action: "APPROVE" | "REJECT";
      reason?: string;
    }
  ): Promise<GenericMessageResponse> {
    try {
      const res = await httpClient.request<GenericMessageResponse>({
        url: adminReturnActionUrl(orderId),
        method: "POST",
        requiresAuth: true,
        data: payload,
      });

      return res;
    } catch (error) {
      throw handleApiError(error, "returnAction");
    }
  }

  /* ---------------- MARK RECEIVED ---------------- */
  static async markReturnReceived(
    orderId: string,
    itemIds: string[]
  ): Promise<GenericMessageResponse> {
    try {
      const res = await httpClient.request<GenericMessageResponse>({
        url: adminReturnReceivedUrl(orderId),
        method: "POST",
        requiresAuth: true,
        data: { itemIds },
      });

      return res;
    } catch (error) {
      throw handleApiError(error, "markReturnReceived");
    }
  }

  /* ---------------- INITIATE REFUND ---------------- */
  static async processRefund(
    orderId: string,
    itemIds: string[],
    refundAmount?: number
  ): Promise<GenericMessageResponse> {
    try {
      const res = await httpClient.request<GenericMessageResponse>({
        url: adminRefundUrl(orderId),
        method: "POST",
        requiresAuth: true,
        data: { itemIds, refundAmount },
      });

      return res;
    } catch (error) {
      throw handleApiError(error, "processRefund");
    }
  }
}
