import {
    apiHandler,
    createSuccessResponse,
    ExternalApiError,
  } from "@/lib/apiHandler";
  
  import { httpClient } from "@/lib/httpClient";
  import { isHttpClientError } from "@/lib/httpClientError";
  
  import { EX_SECTION_BANNERS_URL } from "@/constants/apis";
  
  import { NextRequest, NextResponse } from "next/server";
  
  /* ---------------- CREATE ---------------- */
  export const POST = apiHandler(
    async (req: NextRequest) => {
      try {
        const authorization = req.headers.get("authorization");
  
        if (!authorization) {
          return NextResponse.json(
            { message: "Missing Authorization header" },
            { status: 401 }
          );
        }
  
        const body = await req.json();
  
        const response = await httpClient.request({
          url: EX_SECTION_BANNERS_URL,
          method: "POST",
          data: body,
          headers: {
            Authorization: authorization,
          },
        });
  
        return createSuccessResponse(response, 201);
      } catch (error) {
  
        if (isHttpClientError(error)) {
          throw new ExternalApiError(
            error.data?.message ??
              error.message ??
              "Failed to create section banner",
            error.status,
            error.data
          );
        }
  
        throw error;
      }
    },
    { allowedMethods: ["POST"] }
  );