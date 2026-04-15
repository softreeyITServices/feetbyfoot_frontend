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
  __v: number;
};

export type CreateCouponResponse = Coupon;

export type ApplyCouponResponse = {
  couponCode: string;
  discount: number;
  finalAmount: number;
};

export type ApplyCouponApiResponse = {
  message: string;
  data: ApplyCouponResponse;
}

export type GetAllCouponsResponse = {
  message: string;
  data: Coupon[];
};