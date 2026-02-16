export type AddressType = "Billing" | "Shipping";

export interface Address {
  _id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isDefault: boolean;
  type: AddressType;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressPayload {
  fullName: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  addressLine1: string;
  addressLine2?: string;
  pincode: string;
  isDefault: boolean;
  type: AddressType;
  latitude?: number;
  longitude?: number;
}

export interface ApiRawResponse<T> {
  message: string;
  data: T;
}

export interface ApiResponse<T>{
  data: ApiRawResponse<T>;
}
