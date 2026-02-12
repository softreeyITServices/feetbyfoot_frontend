// src/app/api/auth/verify-otp/route.ts
import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { VerifyOtpResponse } from "@/domain/shared/types/auth.type";
import { EX_VERIFY_OTP_URL } from "@/constants/apis";
import { isHttpClientError } from "@/lib/httpClientError";
import { VerifyOtpSchema } from "@/domain/interfaces/dtos/verifyOtp.dto";

export const POST = apiHandler(
  async (_, context) => {
    try {
      const body = context.data; // ✅ now populated

      const response = await httpClient.post<VerifyOtpResponse>(
        EX_VERIFY_OTP_URL,
        body,
        { skipAuth: true }
      );

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
            error.message ??
            "OTP verification failed",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  {
    schema: VerifyOtpSchema,
    allowedMethods: ["POST"],
  }
);
