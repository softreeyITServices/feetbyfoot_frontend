// src/app/api/auth/refresh-token/route.ts
import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { RefreshResponse } from "@/domain/shared/types/auth.type";
import { EX_REFRESH_TOKEN_URL } from "@/constants/apis";
import { isHttpClientError } from "@/lib/httpClientError";

export const POST = apiHandler(
  async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const refreshToken = searchParams.get("refreshToken");

      if (!refreshToken) {
        throw new ExternalApiError(
          "Missing refreshToken",
          400
        );
      }

      const response = await httpClient.post<RefreshResponse>(
        EX_REFRESH_TOKEN_URL,
        undefined,
        {
          params: { refreshToken },
          skipAuth: true,
        }
      );

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
            error.message ??
            "Failed to refresh token",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  {
    allowedMethods: ["POST"],
  }
);
