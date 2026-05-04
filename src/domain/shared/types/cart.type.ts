export interface CartItem {
  _id: string;
  productId: string;
  size: string;
  quantity: number;
  productImage: string;
  productName: string;
  productSlug: string;
  unitPrice: number;
  sizeDetails: {
    isActive: boolean;
    productId: string;
    quantity: number;
    size: string;
  }
}

export interface AppliedFee {
  name: string;
  amount: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  couponCode?: string;
  discountAmount: number;
  gstAmount: number;
  platformFee: number;
  appliedFees: AppliedFee[];
  shippingCost: number;
  shippingMethod: string;
  effectiveSubtotal: number;
  subtotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

/* -------- API Contracts -------- */

export interface AddToCartRequest {
  productId: string;
  size: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  productId: string;
  size: string;
  quantity: number;
}

export interface DeleteCartItemsRequest {
  items: {
    productId: string;
    size: string;
    itemId?: string;
  }[];
}

export interface CartResponse {
  success: boolean,
  data: {
    data: Cart
  },
  timestamp: string
};
