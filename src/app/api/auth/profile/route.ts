import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_UPDATE_PROFILE_URL } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";

interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
}

export const PATCH = apiHandler(
  async (req: NextRequest) => {
    try {
      const authorization = req.headers.get("authorization");

      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 }
        );
      }
      const body: UpdateProfilePayload = await req.json();

      const response = await httpClient.request({
        url: EX_UPDATE_PROFILE_URL,
        method: "PATCH",
        data: body,
        headers: {
          Authorization: authorization,
        },
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
          error.message ??
          "Failed to update profile",
          error.status,
          error.data
        );
      }

      throw error;
    }
  },
  {
    allowedMethods: ["PATCH"],
  }
);
