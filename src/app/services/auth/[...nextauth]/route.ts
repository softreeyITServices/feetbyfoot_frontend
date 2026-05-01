import NextAuth, { type AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { decodeJwt } from "jose";

import { httpClient } from "@/lib/httpClient";
import {
  AuthMeResponse,
  ExtendedJWT,
  ExtendedUser,
  JWTPayload,
  RefreshResponse,
  VerifyOtpResponse,
} from "@/domain/shared/types/auth.type";
import {
  EX_USER_PROFILE_URL,
  REFRESH_TOKEN_URL,
  VERIFY_OTP_URL,
} from "@/constants/apis";

function getTokenExpiry(token: unknown): number {
  if (typeof token !== "string") return Date.now() - 1000;

  try {
    const decoded = decodeJwt(token) as JWTPayload;
    return decoded.exp ? decoded.exp * 1000 : Date.now() - 1000;
  } catch {
    return Date.now() - 1000;
  }
}

function extractTokens(payload: unknown): {
  accessToken?: string;
  refreshToken?: string;
} {
  if (!payload || typeof payload !== "object") return {};

  const root = payload as Record<string, unknown>;
  const firstData =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : null;

  const secondData =
    firstData?.data && typeof firstData.data === "object"
      ? (firstData.data as Record<string, unknown>)
      : null;

  const accessToken =
    (typeof root.accessToken === "string" && root.accessToken) ||
    (typeof firstData?.accessToken === "string" && firstData.accessToken) ||
    (typeof secondData?.accessToken === "string" && secondData.accessToken) ||
    undefined;

  const refreshToken =
    (typeof root.refreshToken === "string" && root.refreshToken) ||
    (typeof firstData?.refreshToken === "string" && firstData.refreshToken) ||
    (typeof secondData?.refreshToken === "string" && secondData.refreshToken) ||
    undefined;

  return { accessToken, refreshToken };
}

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

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },

  providers: [
    Credentials({
      name: "OTP Login",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        type: { label: "Type", type: "text" },
        otp: { label: "OTP", type: "text" },
      },

      async authorize(credentials): Promise<ExtendedUser | null> {
        try {
          if (
            !credentials?.identifier ||
            !credentials?.otp ||
            (credentials.type !== "email" && credentials.type !== "phone")
          ) {
            return null;
          }

          const otpResponse = await httpClient.post<VerifyOtpResponse>(
            VERIFY_OTP_URL,
            {
              identifier: credentials.identifier,
              type: credentials.type,
              otp: credentials.otp,
            },
            { skipAuth: true }
          );

          const { accessToken, refreshToken } = extractTokens(otpResponse);

          if (!accessToken || !refreshToken) return null;

          const accessTokenExpiresAt = getTokenExpiry(accessToken);
          const refreshTokenExpiresAt = getTokenExpiry(refreshToken);

          const meResponse = await httpClient.get<AuthMeResponse>(
            EX_USER_PROFILE_URL,
            undefined,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              skipAuth: true,
            }
          );

          const user = meResponse.data;
          const brandId = extractBrandId(user);

          return {
            id: user._id,
            role: user.role,
            name: user.name,
            email: user.email,
            phone: user.phone,
            brandId,
            accessToken,
            refreshToken,
            accessTokenExpiresAt,
            refreshTokenExpiresAt,
            deviceFingerprint: "web",
          };
        } catch {
          return null;
        }
      },

    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        const t = token as ExtendedJWT;

        return {
          ...t,
          user: {
            ...t.user,
            name: session.name ?? t.user.name,
            email: session.email ?? t.user.email,
            phone: session.phone ?? t.user.phone,
          },
        };
      }
      if (user) {
        const u = user as ExtendedUser;

        return {
          ...token,
          id: u.id,
          user: {
            id: u.id,
            role: u.role,
            name: u.name,
            email: u.email,
            phone: u.phone,
            brandId: u.brandId,
          },
          accessToken: u.accessToken,
          refreshToken: u.refreshToken,
          accessTokenExpiresAt: u.accessTokenExpiresAt,
          refreshTokenExpiresAt: u.refreshTokenExpiresAt,
          refreshCount: 0,
          deviceFingerprint: u.deviceFingerprint,
          createdAt: Date.now(),
          isAuthenticated: true,
          error: undefined,
        };
      }

      const t = token as ExtendedJWT;
      const now = Date.now();

      if (!t.isAuthenticated) {
        return t;
      }

      if (!t.accessToken || !t.refreshToken) {
        return { ...t, error: "MissingTokens" };
      }

      if (now >= t.refreshTokenExpiresAt) {
        return { ...t, error: "RefreshTokenExpired" };
      }

      if (now < t.accessTokenExpiresAt - 60_000) {
        return t;
      }

      try {
        const refreshResponse = await httpClient.post<RefreshResponse>(
          REFRESH_TOKEN_URL,
          undefined,
          {
            params: { refreshToken: t.refreshToken },
            skipAuth: true,
          }
        );

        const { accessToken, refreshToken } = extractTokens(refreshResponse);

        if (!accessToken || !refreshToken) {
          return { ...t, error: "MissingTokens" };
        }

        return {
          ...t,
          accessToken,
          refreshToken,
          accessTokenExpiresAt: getTokenExpiry(accessToken),
          refreshTokenExpiresAt: getTokenExpiry(refreshToken),
          refreshCount: t.refreshCount + 1,
          lastRefreshedAt: Date.now(),
          error: undefined,
        };
      } catch {
        return { ...t, error: "RefreshAccessTokenError" };
      }
    },

    async session({ session, token }) {
      const t = token as ExtendedJWT;

      return {
        ...session,
        user: {
          id: t.user.id,
          role: t.user.role,
          name: t.user.name,
          email: t.user.email,
          phone: t.user.phone,
          brandId: t.user.brandId,
        },
        accessToken: t.accessToken,
        error: t.error,
      };
    },
  },

  secret: process.env.JWT_ACCESS_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
