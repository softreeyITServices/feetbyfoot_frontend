import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { exProductsPublicMegaMenuByIdUrl } from "@/constants/apis";
import type { ApiContext } from "@/domain/shared/types/apiResponse.type";

/** Proxies `GET .../products/public/mega-menu/:menuId`. */
export const GET = apiHandler(
  async (_req, context: ApiContext<unknown, { menuId: string }>) => {
    const menuId = context.params?.menuId;
    if (!menuId) {
      throw new Error("menuId is required");
    }
    try {
      const response = await httpClient.get<unknown>(
        exProductsPublicMegaMenuByIdUrl(menuId),
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
