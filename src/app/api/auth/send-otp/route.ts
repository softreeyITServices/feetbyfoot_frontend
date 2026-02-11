// src/app/api/auth/send-otp/route.ts
import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { EX_SEND_OTP_URL } from "@/constants/apis";
import { isHttpClientError } from "@/lib/httpClientError";
import { SendOtpSchema } from "@/domain/interfaces/dtos/sendOtp.dto";

type SendOtpRequest = {
  identifier: string;
  type: "email" | "phone";
};

type SendOtpResponse = {
  statusCode: number;
  message: string;
};

export const POST = apiHandler(
  async (_, context) => {
    try {
      const body = context.data as SendOtpRequest;
      const response = await httpClient.post<SendOtpResponse>(
        EX_SEND_OTP_URL,
        body,
        { skipAuth: true }
      );

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
          error.message ??
          "Failed to send OTP",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  {
    schema: SendOtpSchema,
    allowedMethods: ["POST"],
  }
);
