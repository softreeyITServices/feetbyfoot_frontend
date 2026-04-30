import { DELIVERY_URL } from "@/constants/apis";
import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";

export interface PincodeServiceabilityResponse {
  delivery_codes: {
    postal_code: {
      pk: number;
      d_pin: number;
      pre_paid: string;
      cash: string;
      pick_up: string;
      repl: string;
      is_oda: string;
      state_code: string;
    };
  }[];
}

export class DeliveryService {
  static async checkServiceability(
    pincode: string,
  ): Promise<PincodeServiceabilityResponse> {
    try {
      const data = await httpClient.request<PincodeServiceabilityResponse>({
        url: `${DELIVERY_URL}/serviceability/${pincode}`,
        method: "GET",
        requiresAuth: false,
      });
      return data;
    } catch (error) {
      throw handleApiError(error, "checkServiceability");
    }
  }

  static async trackShipment(waybill: string): Promise<any> {
    try {
      const data = await httpClient.request<any>({
        url: `${DELIVERY_URL}/track/${waybill}`,
        method: "GET",
        requiresAuth: false,
      });
      return data;
    } catch (error) {
      throw handleApiError(error, "trackShipment");
    }
  }
}


