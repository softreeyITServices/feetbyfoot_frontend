import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { exProductsMenuByIdUrl } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";
import type { ApiContext } from "@/domain/shared/types/apiResponse.type";

/** Proxies `GET /products/menus/:menuId` (admin full document). */
export const GET = apiHandler(
  async (req: NextRequest, context: ApiContext<unknown, { menuId: string }>) => {
    const menuId = context.params?.menuId;
    if (!menuId) {
      return NextResponse.json({ message: "menuId is required" }, { status: 400 });
    }
    try {
      const authorization = req.headers.get("authorization");
      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 }
        );
      }

      const response = await httpClient.request({
        url: exProductsMenuByIdUrl(menuId),
        method: "GET",
        headers: { Authorization: authorization },
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
            error.message ??
            "Failed to fetch menu",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET"] }
);

/** Proxies `PATCH /products/menus/:menuId` (admin partial update). */
export const PATCH = apiHandler(
  async (req: NextRequest, context: ApiContext<unknown, { menuId: string }>) => {
    const menuId = context.params?.menuId;
    if (!menuId) {
      return NextResponse.json({ message: "menuId is required" }, { status: 400 });
    }
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
        url: exProductsMenuByIdUrl(menuId),
        method: "PATCH",
        data: body,
        headers: { Authorization: authorization },
      });

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
            error.message ??
            "Failed to update menu",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["PATCH"] }
);
