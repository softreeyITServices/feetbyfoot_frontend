import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_BANNERS_URL } from "@/constants/apis";
import {
  BannerListResponse,
  BannerResponse,
} from "@/domain/shared/types/banner.type";
import { NextRequest } from "next/server";

export const GET = apiHandler(
  async () => {
    try {
      const response = await httpClient.get<BannerListResponse>(
        `${EX_BANNERS_URL}`,
        undefined
      );

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ?? error.message ?? "Failed to fetch banners",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET"] }
);

export const POST = apiHandler(
  async (req: NextRequest) => {
    try {
      const body = await req.json();

      const response = await httpClient.post<BannerResponse>(
        `${EX_BANNERS_URL}`,
        body
      );

      return createSuccessResponse(response, 201);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ?? error.message ?? "Failed to create banner",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["POST"] }
);
