// app/api/auth/register/route.ts
import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { RegisterSchema } from "@/domain/interfaces/dtos/createUser.dto";
import { httpClient } from "@/lib/httpClient";
import { EX_REGISTER_URL } from "@/constants/apis";
import { isHttpClientError } from "@/lib/httpClientError";

export const POST = apiHandler(
  async (_, context) => {
    try {
      const response = await httpClient.request({
        url: EX_REGISTER_URL,
        method: "POST",
        data: context.data,
        skipAuth: true,
      });
      return createSuccessResponse(response, 201);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
          error.message ??
          "Registration failed",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  {
    schema: RegisterSchema,
    allowedMethods: ["POST"],
  }
);