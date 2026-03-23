// src/app/api/products/[id]/route.ts

import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { isHttpClientError } from "@/lib/httpClientError";
import { NextRequest, NextResponse } from "next/server";
import { httpClient } from "@/lib/httpClient";
import { EX_PRODUCTS_URL, EX_REFRESH_TOKEN_URL } from "@/constants/apis";
import { PublicProductsApiResponse } from "@/domain/shared/types/product.type";
import { ApiContext } from "@/domain/shared/types/apiResponse.type";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getToken } from "next-auth/jwt";

/* ---------------- SANITIZE ---------------- */
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

/* ---------------- AUTH ---------------- */
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

  const refreshToken =
    typeof token?.refreshToken === "string" ? token.refreshToken : undefined;

  if (refreshToken) {
    try {
      const refreshResponse = await httpClient.post(EX_REFRESH_TOKEN_URL, undefined, {
        params: { refreshToken },
        skipAuth: true,
      });

      const responseObject =
        refreshResponse && typeof refreshResponse === "object"
          ? (refreshResponse as Record<string, unknown>)
          : null;

      const firstData =
        responseObject?.data && typeof responseObject.data === "object"
          ? (responseObject.data as Record<string, unknown>)
          : null;

      const secondData =
        firstData?.data && typeof firstData.data === "object"
          ? (firstData.data as Record<string, unknown>)
          : null;

      const refreshedAccessToken =
        (typeof responseObject?.accessToken === "string" &&
          responseObject.accessToken) ||
        (typeof firstData?.accessToken === "string" && firstData.accessToken) ||
        (typeof secondData?.accessToken === "string" && secondData.accessToken) ||
        undefined;

      if (refreshedAccessToken) return `Bearer ${refreshedAccessToken}`;
    } catch {
      // Ignore refresh failures here and continue normal fallbacks.
    }
  }

  const session = await getServerSession(authOptions);

  const sessionAccessToken =
    typeof session?.accessToken === "string"
      ? session.accessToken
      : undefined;

  return sessionAccessToken ? `Bearer ${sessionAccessToken}` : null;
}

/* ---------------- GET ---------------- */
export const GET = apiHandler(
  async (req: NextRequest, context) => {
    try {
      const id = context.params?.id;

      if (!id) {
        throw new Error("Product id is required");
      }

      const response = await httpClient.get<PublicProductsApiResponse>(
        `${EX_PRODUCTS_URL}/${id}`,
        { skipAuth: true }
      );

      return createSuccessResponse(response.data, 200);
    } catch (error: unknown) {
      if (isHttpClientError(error)) {
        throw new ExternalApiError(
          error.data?.message ??
            error.message ??
            "Failed to fetch product",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET"] }
);

/* ---------------- PATCH ---------------- */
export const PATCH = apiHandler(
  async (req: NextRequest, context: ApiContext<unknown>) => {
    try {
      const authorization = await resolveAuthorizationHeader(req);

      if (!authorization) {
        if (process.env.NODE_ENV === "development") {
          const jwt = await getToken({
            req,
            secret: process.env.JWT_ACCESS_SECRET,
          });
          const session = await getServerSession(authOptions);

          console.warn(
            JSON.stringify({
              type: "auth_debug",
              path: req.nextUrl.pathname,
              method: req.method,
              hasAuthorizationHeader: Boolean(
                req.headers.get("authorization")
              ),
              hasJwtToken: Boolean(jwt),
              hasJwtAccessToken:
                typeof jwt?.accessToken === "string" &&
                jwt.accessToken.length > 0,
              hasJwtRefreshToken:
                typeof jwt?.refreshToken === "string" &&
                jwt.refreshToken.length > 0,
              hasSession: Boolean(session),
              hasSessionAccessToken:
                typeof session?.accessToken === "string" &&
                session.accessToken.length > 0,
            })
          );
        }

        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 }
        );
      }

      const body = await req.json();
      const sanitizedBody = stripProductServerFields(body);

      const response = await httpClient.request({
        url: `${EX_PRODUCTS_URL}/${context.params?.id}`,
        method: "PATCH",
        data: sanitizedBody,
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
            "Failed to update product",
          error.status ?? 502,
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
      const authorization = await resolveAuthorizationHeader(req);
      console.log("SESSION:", await getServerSession(authOptions));
      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 }
        );
      }

      const response = await httpClient.request({
        url: `${EX_PRODUCTS_URL}/${context.params?.id}`,
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
            "Failed to delete product",
          error.status ?? 502,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["DELETE"] }
);