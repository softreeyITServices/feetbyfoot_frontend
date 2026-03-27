import {
    apiHandler,
    createSuccessResponse,
    ExternalApiError,
  } from "@/lib/apiHandler";
  
  import { httpClient } from "@/lib/httpClient";
  import { isHttpClientError } from "@/lib/httpClientError";
  
  import { EX_SECTION_BANNERS_URL } from "@/constants/apis";
  
  import { ApiContext } from "@/domain/shared/types/apiResponse.type";
  import { NextRequest, NextResponse } from "next/server";
  
  /* ---------------- UPDATE ---------------- */
  export const PATCH = apiHandler(
    async (req: NextRequest, context: ApiContext<unknown>) => {
  
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
          url: `${EX_SECTION_BANNERS_URL}/${context.params?.id}`,
          method: "PATCH",
          data: body,
          headers: {
            Authorization: authorization,
          },
        });
  
        return createSuccessResponse(response, 200);
  
      } catch (error) {
  
        if (isHttpClientError(error)) {
          throw new ExternalApiError(
            error.data?.message ??
              error.message ??
              "Failed to update banner",
            error.status,
            error.data
          );
        }
  
        throw error;
      }
    },
    { allowedMethods: ["PATCH"] }
  );
  
  
  /* ---------------- DELETE ---------------- */
  export const DELETE = apiHandler(
    async (req: NextRequest, context: ApiContext<unknown>) => {
  
      try {
  
        const authorization = req.headers.get("authorization");
  
        if (!authorization) {
          return NextResponse.json(
            { message: "Missing Authorization header" },
            { status: 401 }
          );
        }
  
        const response = await httpClient.request({
          url: `${EX_SECTION_BANNERS_URL}/${context.params?.id}`,
          method: "DELETE",
          headers: {
            Authorization: authorization,
          },
        });
  
        return createSuccessResponse(response, 200);
  
      } catch (error) {
  
        if (isHttpClientError(error)) {
          throw new ExternalApiError(
            error.data?.message ??
              error.message ??
              "Failed to delete banner",
            error.status,
            error.data
          );
        }
  
        throw error;
      }
    },
    { allowedMethods: ["DELETE"] }
  );