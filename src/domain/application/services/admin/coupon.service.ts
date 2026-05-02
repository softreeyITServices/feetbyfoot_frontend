import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { COUPONS_URL } from "@/constants/apis";

/* ================= TYPES ================= */

export type Coupon = {
  _id: string;
  code: string;
  discountType: "FLAT" | "PERCENTAGE";
  discountValue: number;
  minOrderValue: number;
  expiryDate: string;
  isActive: boolean;
  maxUsage: number;
  usedCount: number;
  perUserLimit: number;
  createdAt: string;
  updatedAt: string;
};

export type CouponPayload = {
  code: string;
  discountType: "FLAT" | "PERCENTAGE";
  discountValue: number;
  minOrderValue: number;
  expiryDate: string;
  maxUsage: number;
  perUserLimit: number;
  isActive: boolean;
};

/* ✅ API RESPONSE (matches your backend) */
type ApiResponse<T> = {
  success: boolean;
  data: {
    message: string;
    data: T;
  };
  timestamp: string;
};

/* =========================================================
   SERVICE
========================================================= */

export class CouponService {
  /* ---------------- GET ALL ---------------- */
  static async getAll(): Promise<Coupon[]> {
    try {
      const res :any = await httpClient.request<ApiResponse<Coupon[]>>({
        url: COUPONS_URL,
        method: "GET",
        requiresAuth: true,
      });

      return res.data; // ✅ correct extraction
    } catch (error) {
      throw handleApiError(error, "getAllCoupons");
    }
  }

  /* ---------------- CREATE ---------------- */
  static async create(payload: CouponPayload): Promise<void> {
    try {
      await httpClient.request({
        url: COUPONS_URL,
        method: "POST",
        data: payload,
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "createCoupon");
    }
  }

  /* ---------------- DELETE ---------------- */
  static async delete(
    id: string,
    type: "hard" | "soft" = "soft"
  ): Promise<void> {
    try {
      await httpClient.request({
        url: `${COUPONS_URL}/${id}?type=${type}`,
        method: "DELETE",
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "deleteCoupon");
    }
  }
}