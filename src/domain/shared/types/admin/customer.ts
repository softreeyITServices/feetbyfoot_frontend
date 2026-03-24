export interface AdminCustomer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  deviceId?: string;
  deviceType?: string;
  deviceToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerListApiResponse {
  success: boolean;
  message: string;
  pagination: PaginationMeta;
  data: AdminCustomer[];
}

export interface SingleCustomerApiResponse {
  success: boolean;
  message: string;
  data: AdminCustomer;
}

export interface CustomerOrdersApiResponse {
  success: boolean;
  message: string;
  customer: Pick<AdminCustomer, "_id" | "name" | "email" | "phone">;
  pagination: PaginationMeta;
  data: CustomerOrder[];
}

export interface CustomerOrderDetailApiResponse {
  success: boolean;
  message: string;
  data: CustomerOrderDetails;
}

export interface CustomerOrder {
  _id: string;
  userId: string;
  uuid: string;
  orderId: string;
  orderNumber: string;
  items: unknown[];
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  paymentMethod: string;
  platformFee: number;
  gstAmount: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOrderDetails {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  items: unknown[];
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  createdAt: string;
  updatedAt: string;
}

