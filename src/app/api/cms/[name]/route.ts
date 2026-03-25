// src/app/api/v1/cms/[name]/route.ts

import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_CMS_URL } from "@/constants/apis";
import { NextRequest } from "next/server";
import { ApiContext } from "@/domain/shared/types/apiResponse.type";

/* ---------------- GET CMS BY NAME ---------------- */
export const GET = apiHandler(
  async (req: NextRequest, context: ApiContext<unknown>) => {
    try {
      const name = context.params?.name;

      const response = await httpClient.request({
        url: `${EX_CMS_URL}/${name}`,
        method: "GET",
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ?? "Failed to fetch CMS by name",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET"] }
);