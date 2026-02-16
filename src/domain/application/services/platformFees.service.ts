import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { PLATFORM_FEES_URL } from "@/constants/apis";
import {
  PlatformFee,
  CreatePlatformFeeRequest,
  UpdatePlatformFeeRequest,
} from "@/domain/shared/types/platform-fee.type";

class PlatformFeesService {
  /* ---------------- GET ALL ---------------- */
  async getAll(): Promise<PlatformFee[]> {
    try {
      const response = await httpClient.request<PlatformFee[]>({
        url: PLATFORM_FEES_URL,
        method: "GET",
        requiresAuth: true,
      });

      return response;
    } catch (error) {
      handleApiError(error, "getAllPlatformFees");
    }
  }

  /* ---------------- GET ACTIVE ---------------- */
  async getActive(): Promise<PlatformFee[]> {
    try {
      const response = await httpClient.request<{
        success: boolean;
        data: PlatformFee[];
      }>({
        url: `${PLATFORM_FEES_URL}/active`,
        method: "GET",
        requiresAuth: true,
      });

      return response.data ?? [];
    } catch (error) {
      handleApiError(error, "getActivePlatformFees");
    }
  }


  /* ---------------- GET BY ID ---------------- */
  async getById(id: string): Promise<PlatformFee> {
    try {
      const response = await httpClient.request<PlatformFee>({
        url: `${PLATFORM_FEES_URL}/${id}`,
        method: "GET",
        requiresAuth: true,
      });

      return response;
    } catch (error) {
      handleApiError(error, "getPlatformFeeById");
    }
  }

  /* ---------------- CREATE ---------------- */
  async create(
    payload: CreatePlatformFeeRequest
  ): Promise<PlatformFee> {
    try {
      const response = await httpClient.request<PlatformFee>({
        url: PLATFORM_FEES_URL,
        method: "POST",
        requiresAuth: true,
        data: payload,
      });

      return response;
    } catch (error) {
      handleApiError(error, "createPlatformFee");
    }
  }

  /* ---------------- UPDATE ---------------- */
  async update(
    id: string,
    payload: UpdatePlatformFeeRequest
  ): Promise<PlatformFee> {
    try {
      const response = await httpClient.request<PlatformFee>({
        url: `${PLATFORM_FEES_URL}/${id}`,
        method: "PATCH",
        requiresAuth: true,
        data: payload,
      });

      return response;
    } catch (error) {
      handleApiError(error, "updatePlatformFee");
    }
  }

  /* ---------------- DELETE ---------------- */
  async delete(id: string): Promise<void> {
    try {
      await httpClient.request<void>({
        url: `${PLATFORM_FEES_URL}/${id}`,
        method: "DELETE",
        requiresAuth: true,
      });
    } catch (error) {
      handleApiError(error, "deletePlatformFee");
    }
  }
}

export const platformFeesService = new PlatformFeesService();
