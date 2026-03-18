import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_BANNERS_URL } from "@/constants/apis";
import { BannerListResponse } from "@/domain/shared/types/banner.type";

export const GET = apiHandler(
  async () => {
    try {
      const response = await httpClient.request <BannerListResponse>({
        url: `${EX_BANNERS_URL}/active`,
        method: "GET",
        skipAuth: true
      });
       
      console.log("kfdhgkjdfhkdhkdf",response);

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
            error.message ??
            "Failed to fetch active banners",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET"] }
);
