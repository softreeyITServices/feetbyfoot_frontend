// src/app/api/products/route.ts
import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_PRODUCTS_URL } from "@/constants/apis";
import { PublicProductsApiResponse } from "@/domain/shared/types/product.type";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function stripProductServerFields(input: unknown) {
  if (!input || typeof input !== "object") return input;

  const {
    _id: _ignoredId,
    id: _ignoredClientId,
    __v: _ignoredVersion,
    createdAt: _ignoredCreatedAt,
    updatedAt: _ignoredUpdatedAt,
    createdBy: _ignoredCreatedBy,
    ratingAverage: _ignoredRatingAverage,
    totalRatings: _ignoredTotalRatings,
    reviews: _ignoredReviews,
    isInWishlist: _ignoredIsInWishlist,
    ...rest
  } = input as Record<string, unknown>;

  return rest;
}

async function resolveAuthorizationHeader(req: NextRequest) {
  const authorization = req.headers.get("authorization");
  if (authorization) return authorization;

  const token = await getToken({
    req,
    secret: process.env.JWT_ACCESS_SECRET,
  });

  const accessToken =
    typeof token?.accessToken === "string" ? token.accessToken : undefined;

  if (accessToken) return `Bearer ${accessToken}`;

  const session = await getServerSession(authOptions);
  const sessionAccessToken =
    typeof session?.accessToken === "string" ? session.accessToken : undefined;

  return sessionAccessToken ? `Bearer ${sessionAccessToken}` : null;
}

export const GET = apiHandler(
  async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);

      const params = new URLSearchParams();
      searchParams.forEach((value, key) => {
        params.append(key, value); // preserves duplicates
      });

      const response = await httpClient.get<PublicProductsApiResponse>(
        `${EX_PRODUCTS_URL}/public?${params.toString()}`,
        undefined,
        { skipAuth: true }
      );

      return createSuccessResponse(response, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ?? error.message ?? "Failed to fetch products",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  {
    allowedMethods: ["GET"],
  }
);

export const POST = apiHandler(
  async (req: NextRequest) => {
    try {
      const authorization = await resolveAuthorizationHeader(req);

      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 }
        );
      }

      const body = await req.json();
      const sanitizedBody = stripProductServerFields(body);

      const response = await httpClient.request({
        url: EX_PRODUCTS_URL,
        method: "POST",
        data: sanitizedBody,
        headers: {
          Authorization: authorization,
        },
      });

      return createSuccessResponse(response, 201);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ?? error.message ?? "Failed to create product",
          error.status ?? 502,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["POST"] }
);




