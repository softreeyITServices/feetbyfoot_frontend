import { DELIVERY_URL } from "@/constants/apis";
import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";

/* ================= TYPES ================= */

/** Courier states pushed by Delhivery's webhook. Mirrors the backend enum. */
export type CourierStatus =
  | "MANIFESTED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "NDR"
  | "RTO_INITIATED"
  | "RTO_DELIVERED"
  | "CANCELLED"
  | "LOST"
  | "UNKNOWN";

/** The only actions Delhivery accepts on a failed delivery. RTO is NOT one. */
export type NdrAction = "RE-ATTEMPT" | "DEFER_DLV" | "EDIT_DETAILS";

export type DelhiveryInfo = {
  waybill?: string;
  status?: CourierStatus;
  trackingUrl?: string;
  lastEvent?: string;
  lastEventAt?: string;
  ndrCount?: number;
  ndrReason?: string;
  ndrLastAt?: string;
  ndrAction?: NdrAction;
  codRemittedAt?: string;
  shippingChargePaise?: number;
};

export type ShipmentRow = {
  _id: string;
  orderNumber: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  deliveredAt?: string;
  delhivery?: DelhiveryInfo;
};

export type ShipmentPage = {
  page: number;
  limit: number;
  total: number;
  rows: ShipmentRow[];
};

export type OpenNdrRow = {
  _id: string;
  orderNumber: string;
  orderStatus: string;
  paymentMethod: string;
  totalAmount: number;
  shippingAddress?: { fullName?: string; phone?: string; pincode?: string };
  delhivery?: DelhiveryInfo;
};

export type UnremittedRow = {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  deliveredAt?: string;
  delhivery?: { waybill?: string };
};

export type ReconcileStatus =
  | "MATCHED"
  | "AMOUNT_MISMATCH"
  | "UNKNOWN_WAYBILL"
  | "NOT_COD"
  | "DUPLICATE";

export type RemittanceReport = {
  ingested: number;
  matched: number;
  needsReview: number;
  byStatus: Record<string, number>;
  exceptions: Array<{
    waybill: string;
    remittanceNumber: string;
    status: ReconcileStatus;
    orderNumber?: string;
    /** Difference in paise: collected minus expected. Negative = short paid. */
    variancePaise?: number;
  }>;
  /** Rows the parser could not read, with the line number and why. */
  skippedRows: Array<{ line: number; reason: string }>;
};

export type DeliveryEvent = {
  waybill: string;
  rawStatus?: string;
  statusType?: string;
  nslCode?: string;
  scanAt: string;
  mappedStatus: CourierStatus;
  applied: boolean;
  skipReason?: string;
};

export type AdminTracking = {
  order: ShipmentRow & { codCollectedAt?: string };
  waybills: string[];
  events: DeliveryEvent[];
};

/* ================= SERVICE ================= */

export class AdminDeliveryService {
  /** All shipments with their current courier status. */
  static async listShipments(params: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ShipmentPage> {
    try {
      return await httpClient.request<ShipmentPage>({
        url: `${DELIVERY_URL}/shipments`,
        method: "GET",
        params,
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "listShipments");
    }
  }

  /** Full courier detail for one order: raw scans, NDR history, COD state. */
  static async trackOrder(orderId: string): Promise<AdminTracking> {
    try {
      return await httpClient.request<AdminTracking>({
        url: `${DELIVERY_URL}/admin/track/${orderId}`,
        method: "GET",
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "trackOrder");
    }
  }

  /** Parcels whose delivery attempt failed and still need a decision. */
  static async listOpenNdrs(): Promise<OpenNdrRow[]> {
    try {
      return await httpClient.request<OpenNdrRow[]>({
        url: `${DELIVERY_URL}/ndr/open`,
        method: "GET",
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "listOpenNdrs");
    }
  }

  /**
   * Act on a failed delivery. `deferred_date` is required for DEFER_DLV;
   * name/phone/add apply to EDIT_DETAILS.
   */
  static async actOnNdr(
    waybill: string,
    body: {
      act: NdrAction;
      deferred_date?: string;
      name?: string;
      phone?: string;
      add?: string;
    },
  ): Promise<{ orderNumber: string; waybill: string; upl_id: string }> {
    try {
      return await httpClient.request({
        url: `${DELIVERY_URL}/ndr/${waybill}`,
        method: "POST",
        data: body,
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "actOnNdr");
    }
  }

  /** Delivered COD orders whose cash Delhivery has not paid us. */
  static async listUnremitted(graceDays = 7): Promise<UnremittedRow[]> {
    try {
      return await httpClient.request<UnremittedRow[]>({
        url: `${DELIVERY_URL}/cod/unremitted`,
        method: "GET",
        params: { graceDays },
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "listUnremitted");
    }
  }

  /**
   * Upload the CSV from Delhivery One > Finances > Remittance.
   *
   * `remittanceNumber` is required because Delhivery's export omits it from
   * the rows — it names the download folder after it. It is also the key that
   * stops a re-upload from crediting the same orders twice.
   */
  static async uploadRemittance(
    file: File,
    remittanceNumber: string,
  ): Promise<RemittanceReport> {
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("remittanceNumber", remittanceNumber);

      return await httpClient.request<RemittanceReport>({
        url: `${DELIVERY_URL}/cod/remittance/upload`,
        method: "POST",
        data: form,
        // Required. The axios instance defaults Content-Type to
        // application/json, which would send the FormData as an empty JSON
        // body and the server would see no file at all.
        headers: { "Content-Type": "multipart/form-data" },
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "uploadRemittance");
    }
  }

  /* ---------- CSV downloads ---------- */

  /**
   * These endpoints return `text/csv`, not JSON. `responseType: "blob"` is
   * mandatory — without it axios parses the body and the saved file is garbage.
   */
  private static async downloadCsv(
    url: string,
    filename: string,
    params?: Record<string, unknown>,
  ): Promise<void> {
    const blob = await httpClient.request<Blob>({
      url,
      method: "GET",
      params,
      responseType: "blob",
      requiresAuth: true,
    });
    triggerDownload(blob, filename);
  }

  static async exportShipments(status?: string): Promise<void> {
    try {
      await this.downloadCsv(
        `${DELIVERY_URL}/shipments/export.csv`,
        `shipments-${today()}.csv`,
        status ? { status } : undefined,
      );
    } catch (error) {
      throw handleApiError(error, "exportShipments");
    }
  }

  static async exportOpenNdrs(): Promise<void> {
    try {
      await this.downloadCsv(
        `${DELIVERY_URL}/ndr/open/export.csv`,
        `ndr-open-${today()}.csv`,
      );
    } catch (error) {
      throw handleApiError(error, "exportOpenNdrs");
    }
  }

  static async exportUnremitted(graceDays = 7): Promise<void> {
    try {
      await this.downloadCsv(
        `${DELIVERY_URL}/cod/unremitted/export.csv`,
        `cod-unremitted-${today()}.csv`,
        { graceDays },
      );
    } catch (error) {
      throw handleApiError(error, "exportUnremitted");
    }
  }

  /** Reconcile the uploaded file and download only the rows needing review. */
  static async uploadRemittanceExceptions(
    file: File,
    remittanceNumber: string,
  ): Promise<void> {
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("remittanceNumber", remittanceNumber);

      const blob = await httpClient.request<Blob>({
        url: `${DELIVERY_URL}/cod/remittance/upload/exceptions.csv`,
        method: "POST",
        data: form,
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
        requiresAuth: true,
      });
      triggerDownload(blob, `cod-exceptions-${today()}.csv`);
    } catch (error) {
      throw handleApiError(error, "uploadRemittanceExceptions");
    }
  }
}

/* ================= HELPERS ================= */

const today = () => new Date().toISOString().slice(0, 10);

/** Save a blob by clicking a temporary anchor, then release the object URL. */
function triggerDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoking immediately can cancel the download in some browsers.
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

/** COURIER_STATUS -> "Out For Delivery". Used by every delivery screen. */
export const humaniseStatus = (s?: string | null): string =>
  !s
    ? "—"
    : s
        .toLowerCase()
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

/** Whole days since a timestamp. Drives "how urgent is this?" columns. */
export const daysSince = (value?: string | null): number | null => {
  if (!value) return null;
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86_400_000);
};
