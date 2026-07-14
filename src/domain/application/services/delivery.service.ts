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
      city?: string;
      district?: string;
    };
  }[];
}

/** What the customer is allowed to see: no NSL codes, no COD internals. */
export interface OrderTracking {
  orderNumber: string;
  orderStatus: string;
  deliveredAt: string | null;
  waybill: string | null;
  trackingUrl: string | null;
  /** The courier's view, ahead of orderStatus between dispatch and delivery. */
  courierStatus: string | null;
  lastUpdatedAt: string | null;
  timeline: Array<{ status: string; at: string }>;
}

export class DeliveryService {
  /**
   * Courier status and scan timeline for the signed-in customer's own order.
   *
   * Prefer this over trackShipment(): it is driven by the scans Delhivery
   * pushes to our webhook rather than polling their API on every page view,
   * and it covers exchange parcels too.
   */
  static async trackMyOrder(orderId: string): Promise<OrderTracking> {
    try {
      return await httpClient.request<OrderTracking>({
        url: `${DELIVERY_URL}/track/order/${orderId}`,
        method: "GET",
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "trackMyOrder");
    }
  }

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


