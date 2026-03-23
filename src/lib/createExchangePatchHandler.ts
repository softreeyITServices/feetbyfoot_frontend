// utils/createExchangePatchHandler.ts

import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_ADMIN_EXCHANGE_URL } from "@/constants/apis";
import { NextRequest } from "next/server";
import { ApiContext } from "@/domain/shared/types/apiResponse.type";

export const createExchangePatchHandler = (path: string) =>
  apiHandler(
    async (req: NextRequest, context: ApiContext<{ id: string }>) => {
      try {
        const authorization = req.headers.get("authorization");
        const id = context.params?.id;

        const body = await req.json();

        const response = await httpClient.request({
          url: `${EX_ADMIN_EXCHANGE_URL}/${id}/${path}`,
          method: "PATCH",
          data: body,
          headers: {
            Authorization: authorization || "",
          },
        });

        return createSuccessResponse(response, 200);
      } catch (error) {
        if (isHttpClientError(error)) {
          throw new ExternalApiError(
            error.data?.message || "Exchange update failed",
            error.status,
            error.data
          );
        }
        throw error;
      }
    },
    { allowedMethods: ["PATCH"] }
  );