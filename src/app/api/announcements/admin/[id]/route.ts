import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { exAnnouncementsAdminByIdUrl } from "@/constants/apis";
import { ApiContext } from "@/domain/shared/types/apiResponse.type";
import { NextRequest, NextResponse } from "next/server";

export const GET = apiHandler(
  async (req: NextRequest, context: ApiContext<unknown>) => {
    try {
      const authorization = req.headers.get("authorization");

      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 }
        );
      }

      const id = context.params?.id;
      if (!id) {
        return NextResponse.json(
          { message: "Missing announcement id" },
          { status: 400 }
        );
      }

      const response = await httpClient.request({
        url: exAnnouncementsAdminByIdUrl(id),
        method: "GET",
        headers: {
          Authorization: authorization,
        },
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
            error.message ??
            "Failed to fetch announcement",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET"] }
);

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

      const id = context.params?.id;
      if (!id) {
        return NextResponse.json(
          { message: "Missing announcement id" },
          { status: 400 }
        );
      }

      const body = await req.json();

      const response = await httpClient.request({
        url: exAnnouncementsAdminByIdUrl(id),
        method: "PATCH",
        data: body,
        headers: {
          Authorization: authorization,
        },
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
            error.message ??
            "Failed to update announcement",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["PATCH"] }
);

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

      const id = context.params?.id;
      if (!id) {
        return NextResponse.json(
          { message: "Missing announcement id" },
          { status: 400 }
        );
      }

      const response = await httpClient.request({
        url: exAnnouncementsAdminByIdUrl(id),
        method: "DELETE",
        headers: {
          Authorization: authorization,
        },
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
            error.message ??
            "Failed to delete announcement",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["DELETE"] }
);
