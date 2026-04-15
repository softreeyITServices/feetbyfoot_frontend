import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { COUPONS_URL } from "@/constants/apis";
import {
  CreateCouponResponse,
  ApplyCouponResponse,
  GetAllCouponsResponse,
  ApplyCouponApiResponse,
} from "@/domain/shared/types/coupon.type";

class CouponService {
  async createCoupon(payload: {
    code: string;
    discountType: string;
    discountValue: number;
    minOrderValue: number;
    expiryDate: string;
    maxUsage: number;
    perUserLimit: number;
    isActive: boolean;
  }): Promise<CreateCouponResponse> {
    try {
      const response =
        await httpClient.request<CreateCouponResponse>({
          url: COUPONS_URL,
          method: "POST",
          data: payload,
        });

      return response;
    } catch (error) {
      handleApiError(error, "createCoupon");
    }
  }

  async applyCoupon(payload: {
    code: string;
    orderAmount: number;
  }): Promise<ApplyCouponResponse> {
    try {
      const response :any =
        await httpClient.request<ApplyCouponApiResponse>({
          url: `${COUPONS_URL}/apply`,
          method: "POST",
          data: payload,
          requiresAuth: true,
        });


      return response 
    } catch (error) {
      handleApiError(error, "applyCoupon");
    }
  }

  async getAllActiveCoupons(): Promise<GetAllCouponsResponse> {
    try {
      const response =
        await httpClient.request<GetAllCouponsResponse>({
          url: `${COUPONS_URL}`,
          method: "GET",
        });

      return response;
    } catch (error) {
      handleApiError(error, "getAllActiveCoupons");
    }
  }
}

export const couponService = new CouponService();