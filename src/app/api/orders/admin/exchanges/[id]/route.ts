  // src/app/api/admin/exchanges/[id]/route.ts

import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_ADMIN_EXCHANGE_URL } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";
import { ApiContext } from "@/domain/shared/types/apiResponse.type";

export const GET = apiHandler(
  async (req: NextRequest, context: ApiContext<{ id: string }>) => {
    try {
      const authorization = req.headers.get("authorization");
      const id = context.params?.id;

      if (!id) {
        return NextResponse.json({ message: "Missing id" }, { status: 400 });
      }

      const response = await httpClient.request({
        url: `${EX_ADMIN_EXCHANGE_URL}/${id}`,
        method: "GET",
        headers: { Authorization: authorization || "" },
      });

      return createSuccessResponse(response, 200);
    } catch (error) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message || "Failed to fetch exchange",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET"] }
);