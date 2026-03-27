import {
    apiHandler,
    createSuccessResponse,
    ExternalApiError,
  } from "@/lib/apiHandler";
  
  import { httpClient } from "@/lib/httpClient";
  import { isHttpClientError } from "@/lib/httpClientError";
  
  import { EX_SECTION_BANNERS_URL } from "@/constants/apis";
  
  /* ---------------- PUBLIC GET ALL ---------------- */
  export const GET = apiHandler(
    async () => {
      try {
  
        const response = await httpClient.request({
          url: `${EX_SECTION_BANNERS_URL}/public/all`,
          method: "GET",
        });
  
        return createSuccessResponse(response, 200);
  
      } catch (error) {
  
        if (isHttpClientError(error)) {
          throw new ExternalApiError(
            error.data?.message ??
              error.message ??
              "Failed to fetch public section banners",
            error.status,
            error.data
          );
        }
  
        throw error;
      }
    },
    { allowedMethods: ["GET"] }
  );