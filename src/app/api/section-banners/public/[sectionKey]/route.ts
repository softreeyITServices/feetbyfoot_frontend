import {
    apiHandler,
    createSuccessResponse,
    ExternalApiError,
  } from "@/lib/apiHandler";
  
  import { httpClient } from "@/lib/httpClient";
  import { isHttpClientError } from "@/lib/httpClientError";
  
  import { EX_SECTION_BANNERS_URL } from "@/constants/apis";
  
  import { ApiContext } from "@/domain/shared/types/apiResponse.type";
  
  /* ---------------- GET BY KEY ---------------- */
  export const GET = apiHandler(
    async (_req, context: ApiContext<unknown>) => {
  
      try {
  
        const response = await httpClient.request({
          url: `${EX_SECTION_BANNERS_URL}/public/${context.params?.sectionKey}`,
          method: "GET",
        });
  
        return createSuccessResponse(response, 200);
  
      } catch (error) {
  
        if (isHttpClientError(error)) {
          throw new ExternalApiError(
            error.data?.message ??
              error.message ??
              "Failed to fetch section banner",
            error.status,
            error.data
          );
        }
  
        throw error;
      }
    },
    { allowedMethods: ["GET"] }
  );