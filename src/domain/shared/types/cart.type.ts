export interface CartItem {
  _id: string;
  productId: string;
  size: string;
  quantity: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
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
    itemId: string;
  }[];
}

export type CartResponse = Cart;
