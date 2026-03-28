import {
  apiHandler,
  createSuccessResponse,
  ExternalApiError,
} from "@/lib/apiHandler";
import { httpClient } from "@/lib/httpClient";
import { isHttpClientError } from "@/lib/httpClientError";
import { EX_PRODUCTS_URL } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
      const authorization = await resolveAuthorizationHeader(req);

      if (!authorization) {
        return NextResponse.json(
          { message: "Missing Authorization header" },
          { status: 401 }
        );
      }

      const { searchParams } = new URL(req.url);
      const params = new URLSearchParams();
      searchParams.forEach((value, key) => {
        params.append(key, value);
      });

      const response = await httpClient.request({
        url: `${EX_PRODUCTS_URL}/admin/list?${params.toString()}`,
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
            "Failed to fetch admin products",
          error.status,
          error.data
        );
      }
      throw error;
    }
  },
  { allowedMethods: ["GET"] }
);
