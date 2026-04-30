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

/* ---------------- ITEM & EXCHANGE ENUMS ---------------- */

export enum OrderItemStatus {
  CONFIRMED = "CONFIRMED",
  PACKED = "PACKED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURN_REQUESTED = "RETURN_REQUESTED",
  RETURN_APPROVED = "RETURN_APPROVED",
  RETURN_RECEIVED = "RETURN_RECEIVED",
  RETURNED = "RETURNED",
  EXCHANGE_REQUESTED = "EXCHANGE_REQUESTED",
  EXCHANGE_APPROVED = "EXCHANGE_APPROVED",
  REPLACEMENT_SHIPPED = "REPLACEMENT_SHIPPED",
  COMPLETED = "COMPLETED",
}

export enum ExchangeStatus {
  EXCHANGE_REQUESTED = "EXCHANGE_REQUESTED",
  EXCHANGE_APPROVED = "EXCHANGE_APPROVED",
  REPLACEMENT_SHIPPED = "REPLACEMENT_SHIPPED",
  EXCHANGE_REJECTED = "EXCHANGE_REJECTED",
  COMPLETED = "COMPLETED",
}

/* ---------------- PAGINATION ---------------- */

export interface OrderMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface PaginatedOrders {
  // message: string;
  data: Order[];
  meta: OrderMeta;
}

export interface PaginatedOrdersResponse {
  data: PaginatedOrders;
}

/* ---------------- PRODUCT SNAPSHOT ---------------- */

export interface ProductSize {
  color?: string;
  size: string;
  quantity: number;
  isActive: boolean;
}

export interface ProductSnapshot {
  _id: string;
  name: string;
  sizes: ProductSize[];
}

/* ---------------- RETURN STRUCTURE (DB) ---------------- */

export interface ReturnRequestInfo {
  reason: string;
  requestedAt: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED";
}

/* ---------------- EXCHANGE STRUCTURE (DB) ---------------- */

export interface ExchangeHistoryItem {
  _id: string;
  exchangeId: string;
  reason?: string;
  oldSize: string;
  newSize: string;
  quantity: number;
  status: ExchangeStatus;
  requestedAt: string;
  approvedAt?: string;
  replacementAwb?: string;
  pickupAwb?: string;
}

/* ---------------- CORE ORDER ITEM ---------------- */

export interface OrderItem {
  _id: string;
  productId: string;
  productName: string;
  productImage: string;
  productSlug: string;
  color?: string;
  size: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  returnRequestedQuantity?: number;
  returnedQuantity?: number;

  status: OrderItemStatus;

  returnRequest?: ReturnRequestInfo;
  exchangeRequests?: ExchangeHistoryItem[];

  waybill?: string;
  trackingUrl?: string;

  product?: ProductSnapshot; // snapshot at order time
}

/* ---------------- CORE ORDER ---------------- */

export interface Order {
  _id: string;
  userId: string;
  orderId: string;
  orderNumber: string;

  items: OrderItem[];

  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  platformFee: number;
  gstAmount: number;
  totalAmount: number;

  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod: string;

  /** Set when COD payment is updated via admin API */
  codPaymentRemarks?: string;
  codTransactionId?: string;

  shippingAddress: {
    _id: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    latitude: number;
    longitude: number;
  };

  uuid: string;
  createdAt: string;
  updatedAt: string;
}

/* ---------------- COD PAYMENT STATUS (ADMIN) ---------------- */

export type CodApiPaymentStatus = "PAID" | "FAILED" | "REFUNDED";

export interface UpdateCodPaymentStatusRequest {
  orderId: string;
  paymentStatus: CodApiPaymentStatus;
  remarks?: string;
  transactionId?: string;
}

/* ---------------- STATUS UPDATE ---------------- */

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  items: {
    orderId: string;
    itemId: string[];
  }[];
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

/* ---------------- EXCHANGE REQUEST PAYLOAD (API) ---------------- */

export type ExchangeItemPayload = {
  orderItemId: string;
  reason: string;
  oldSize: string;
  newSize: string;
  oldColor?: string;
  newColor?: string;
  quantity: number;
};

export type ExchangeRequestPayload = {
  orderId: string;
  lines: ExchangeItemPayload[];
  notes: string;
};

/* ---------------- RETURN REQUEST PAYLOAD (API) ---------------- */

export type ReturnItemPayload = {
  orderId: string;
  itemId: string;
  reason: string;
  quantity?: number;
};

export type ReturnRequestPayload = {
  items: ReturnItemPayload[];
};

/* ---------------- GENERIC RESPONSES ---------------- */

export type ExchangeOrderResponse = {
  message: string;
  data: unknown;
};

export type GenericMessageResponse = {
  message: string;
};
