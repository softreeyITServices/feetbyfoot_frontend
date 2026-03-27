import {
    apiHandler,
    createSuccessResponse,
    ExternalApiError,
  } from "@/lib/apiHandler";
  
  import { httpClient } from "@/lib/httpClient";
  import { isHttpClientError } from "@/lib/httpClientError";
  
  import { EX_SECTION_BANNERS_URL } from "@/constants/apis";
  
  import { ApiContext } from "@/domain/shared/types/apiResponse.type";
  import { NextRequest } from "next/server";
  
  /* ---------------- TOGGLE STATUS ---------------- */
  export const PATCH = apiHandler(
    async (req: NextRequest, context: ApiContext<unknown>) => {
  
      try {
  
        const authorization = req.headers.get("authorization");
  
        const response = await httpClient.request({
          url: `${EX_SECTION_BANNERS_URL}/${context.params?.id}/toggle-status`,
          method: "PATCH",
          headers: {
            Authorization: authorization ?? "",
          },
        });
  
        return createSuccessResponse(response, 200);
  
      } catch (error) {
  
        if (isHttpClientError(error)) {
          throw new ExternalApiError(
            error.data?.message ??
              error.message ??
              "Failed to toggle banner status",
            error.status,
            error.data
          );
        }
  
        throw error;
      }
    },
    { allowedMethods: ["PATCH"] }
  );