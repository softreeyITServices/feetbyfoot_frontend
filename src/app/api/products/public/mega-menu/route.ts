import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_PRODUCTS_PUBLIC_MEGA_MENU_URL } from "@/constants/apis";
import { NextResponse } from "next/server";

/** Proxies `GET .../products/public/mega-menu` (default storefront menu). */
export const GET = apiHandler(
  async () => {
    try {
      const response = await httpClient.get<unknown>(
        EX_PRODUCTS_PUBLIC_MEGA_MENU_URL,
        {},
        { skipAuth: true }
      );

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
            error.message ??
            "Failed to fetch mega menu",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET"] }
);
