/* ---------------- ENUMS ---------------- */

export enum OrderStatus {
  CREATED = "CREATED",
  CONFIRMED = "CONFIRMED",
  PACKED = "PACKED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  PARTIALLY_RETURNED = "PARTIALLY_RETURNED",
  PARTIALLY_EXCHANGED = "PARTIALLY_EXCHANGED",
  PARTIALLY_DELIVERED = "PARTIALLY_DELIVERED",
  RETURNED = "RETURNED",
  EXCHANGED = "EXCHANGED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
}

/* ---------------- PAGINATION ---------------- */

export interface OrderMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
export interface PaginatedOrders {
  message: string;
  data: Order[];
  meta: OrderMeta;
}

export interface PaginatedOrdersResponse {
  data: PaginatedOrders;
}

/* ---------------- CORE ORDER ---------------- */

export interface OrderItem {
  _id: string;
  productId: string;
  productName: string;
  productImage: string;
  productSlug: string;
  size: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  status: string;
}

export interface Order {
  _id: string;
  userId: string;
  orderId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod: string;
  platformFee: number;
  gstAmount: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    latitude: number;
    longitude: number;
    _id: string;
  };
  uuid: string;
  createdAt: string;
  updatedAt: string;
}

/* ---------------- STATUS UPDATE ---------------- */

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  items: {
    productId: string;
    itemId: string[];
  }[];
}

/* ---------------- EXCHANGE ---------------- */

export interface ExchangeRequest {
  reason: string;
  oldSize: string;
  newSize: string;
}
/* ---------------- BULK UPDATE RESULT ---------------- */

export interface BulkWriteResult {
  insertedCount: number;
  matchedCount: number;
  modifiedCount: number;
  deletedCount: number;
  upsertedCount: number;
  upsertedIds: Record<string, unknown>;
  insertedIds: Record<string, unknown>;
}

export interface UpdateOrderStatusResponse {
  message: string;
  data: BulkWriteResult;
}

/* ---------------- EXCHANGE RESPONSE ---------------- */
/* Since backend response not provided,
   keeping it safely structured but NOT using any */
export interface ExchangeOrderResponse {
  message: string;
  data: unknown;
}
