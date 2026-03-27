import {
    apiHandler,
    createSuccessResponse,
    ExternalApiError,
  } from "@/lib/apiHandler";
  
  import { httpClient } from "@/lib/httpClient";
  import { isHttpClientError } from "@/lib/httpClientError";
  
  import { EX_SECTION_BANNERS_URL } from "@/constants/apis";
  
  import { NextRequest } from "next/server";
  
  /* ---------------- ADMIN GET ALL ---------------- */
  export const GET = apiHandler(
    async (req: NextRequest) => {
      try {
  
        const authorization = req.headers.get("authorization");
  
        const response = await httpClient.request({
          url: `${EX_SECTION_BANNERS_URL}/admin/all`,
          method: "GET",
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
              "Failed to fetch section banners",
            error.status,
            error.data
          );
        }
  
        throw error;
      }
    },
    { allowedMethods: ["GET"] }
  );