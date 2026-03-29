import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_PRODUCTS_PUBLIC_MEGA_MENU_URL } from "@/constants/apis";
import { NextRequest } from "next/server";

/** Proxies `GET .../products/public/mega-menu` — optional `?position=top|footer` for placement default. */
export const GET = apiHandler(
  async (req: NextRequest) => {
    try {
      const position = req.nextUrl.searchParams.get("position");
      const query = position ? { position } : {};
      const response = await httpClient.get<unknown>(
        EX_PRODUCTS_PUBLIC_MEGA_MENU_URL,
        query,
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
