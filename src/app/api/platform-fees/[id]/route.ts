import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_PLATFORM_FEES_URL } from "@/constants/apis";
import { NextRequest } from "next/server";

/* ---------------- GET BY ID ---------------- */
export const GET = apiHandler(
  async (req: NextRequest, { params }) => {
    try {
      const id = params?.id;
      const authorization = req.headers.get("authorization");

      const response = await httpClient.request({
        url: `${EX_PLATFORM_FEES_URL}/${id}`,
        method: "GET",
        headers: {
          Authorization: authorization ?? "",
        },
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
          error.message ??
          "Failed to fetch platform fee",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET", "PATCH", "DELETE"] }
);

/* ---------------- UPDATE ---------------- */
export const PATCH = apiHandler(
  async (req: NextRequest, { params }) => {
    try {
      const id = params?.id;
      const body = await req.json();

      const response = await httpClient.request({
        url: `${EX_PLATFORM_FEES_URL}/${id}`,
        method: "PATCH",
        data: body,
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
          error.message ??
          "Failed to update platform fee",
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
  async (req: NextRequest, { params }) => {
    try {
      const id = params?.id;

      const response = await httpClient.request({
        url: `${EX_PLATFORM_FEES_URL}/${id}`,
        method: "DELETE",
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
          error.message ??
          "Failed to delete platform fee",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["DELETE"] }
);
