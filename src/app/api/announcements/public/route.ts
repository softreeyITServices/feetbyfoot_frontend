import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_ANNOUNCEMENTS_PUBLIC_URL } from "@/constants/apis";

export const GET = apiHandler(
  async () => {
    try {
      const response = await httpClient.get(
        EX_ANNOUNCEMENTS_PUBLIC_URL,
        undefined,
        { skipAuth: true }
      );

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
            error.message ??
            "Failed to fetch announcements",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET"] }
);
