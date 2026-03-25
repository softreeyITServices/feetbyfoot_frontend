// src/app/api/blogs/route.ts
import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_BLOGS_URL, EX_USER_PROFILE_URL } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";

function extractBrandId(user: unknown): string | undefined {
  if (!user || typeof user !== "object") return undefined;
  const userObj = user as Record<string, unknown>;

  if (typeof userObj.brandId === "string" && userObj.brandId.trim()) {
    return userObj.brandId;
  }

  const brand = userObj.brand;
  if (brand && typeof brand === "object") {
    const brandObj = brand as Record<string, unknown>;
    if (typeof brandObj._id === "string" && brandObj._id.trim()) {
      return brandObj._id;
    }
    if (typeof brandObj.id === "string" && brandObj.id.trim()) {
      return brandObj.id;
    }
  }

  return undefined;
}

/* ---------------- CREATE BLOG ---------------- */
export const POST = apiHandler(async (req: NextRequest) => {
  try {
    const authorization = req.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Missing Authorization header" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as Record<string, unknown>;

    // if (!body.brandId) {
    //   const profileResponse = await httpClient.request({
    //     url: EX_USER_PROFILE_URL,
    //     method: "GET",
    //     headers: {
    //       Authorization: authorization,
    //     },
    //   });

    //   const user =
    //     profileResponse && typeof profileResponse === "object" && "data" in profileResponse
    //       ? (profileResponse as { data?: unknown }).data
    //       : profileResponse;

    //   const derivedBrandId = extractBrandId(user);

    //   if (!derivedBrandId) {
    //     return NextResponse.json(
    //       { message: "Brand not found for current user" },
    //       { status: 400 }
    //     );
    //   }

    //   body.brandId = derivedBrandId;
    // }

    const response = await httpClient.request({
      url: EX_BLOGS_URL,
      method: "POST",
      data: body,
      headers: {
        Authorization: authorization,
      },
    });

    console.log('response', response);

    return createSuccessResponse(response, 201);
  } catch (error: unknown) {
    if (isHttpClientError(error)) {
      throw new ExternalApiError(
        error.data?.message ?? "Failed to create blog",
        error.status,
        error.data
      );
    }
    throw error;
  }
});

/* ---------------- GET BLOGS ---------------- */
export const GET = apiHandler(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    const query = {
      tag: searchParams.get("tag"),
      isPublished: searchParams.get("isPublished"),
      search: searchParams.get("search"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    };

    const response = await httpClient.request({
      url: EX_BLOGS_URL,
      method: "GET",
      params: query,
    });

    return createSuccessResponse(response, 200);
  } catch (error: unknown) {
    if (isHttpClientError(error)) {
      throw new ExternalApiError(
        error.data?.message ?? "Failed to fetch blogs",
        error.status,
        error.data
      );
    }
    throw error;
  }
});