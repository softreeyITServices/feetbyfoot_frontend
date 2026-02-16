import { ADDRESS_URL } from "@/constants/apis";
import { Address, ApiResponse, CreateAddressPayload } from "@/domain/shared/types/address.types";
import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";

export class AddressService {
  static async create(payload: CreateAddressPayload): Promise<Address> {
    try {
      const { data } = await httpClient.request<ApiResponse<Address>>({
        url: ADDRESS_URL,
        method: "POST",
        data: payload,
        requiresAuth: true,
      });
      return data.data;
    } catch (error) {
      throw handleApiError(error, "createAddress");
    }
  }

  static async getAll(): Promise<Address[]> {
    try {
      const { data } = await httpClient.request<ApiResponse<Address[]>>({
        url: ADDRESS_URL,
        method: "GET",
        requiresAuth: true,
      });
      return data.data;
    } catch (error) {
      throw handleApiError(error, "getAllAddress");
    }
  }

  static async getDefault(): Promise<Address> {
    try {
      const {data} = await httpClient.request<ApiResponse<Address>>({
        url: ADDRESS_URL + '/default',
        method: "GET",
        requiresAuth: true,
      });
      return data.data;
    } catch (error) {
      throw handleApiError(error, "getDefaultAddress");
    }
  }

  static async getById(id: string): Promise<Address> {
    try {
      const {data} = await httpClient.request<ApiResponse<Address>>({
        url: `${ADDRESS_URL}/${id}`,
        method: "GET",
        requiresAuth: true,
      });
      return data.data;
    } catch (error) {
      throw handleApiError(error, "getAddressById");
    }
  }

  static async update(
    id: string,
    payload: Partial<CreateAddressPayload>
  ): Promise<Address> {
    try {
      const {data} = await httpClient.request<ApiResponse<Address>>({
        url: `${ADDRESS_URL}/${id}`,
        method: "PATCH",
        data: payload,
        requiresAuth: true,
      });
      return data.data;
    } catch (error) {
      throw handleApiError(error, "updateAddress");
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await httpClient.request({
        url: `${ADDRESS_URL}/${id}`,
        method: "DELETE",
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "deleteAddress");
    }
  }
}
