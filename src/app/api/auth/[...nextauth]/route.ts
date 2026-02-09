// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { httpClient } from "@/lib/httpClient";
import { AuthMeResponse, ExtendedJWT, ExtendedUser, JWTPayload, LoginResponse, RefreshResponse } from "@/domain/shared/types/auth.type";
import { AUTH } from "@/constants/lang";
import { decodeJwt } from 'jose';
import { EX_LOGIN_URL, EX_USER_PROFILE_URL } from "@/constants/apis";


function getTokenExpiry(token: string): number {
  const decoded = decodeJwt(token) as JWTPayload | null;if (!decoded?.exp) {
    throw new Error(AUTH.INVALID_TOKEN);
  }
  return decoded.exp * 1000;
}

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },

  providers: [
    Credentials({
      name: "Email Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials): Promise<ExtendedUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          const data = await httpClient.post<LoginResponse>(
            EX_LOGIN_URL,
            {
              email: credentials.email,
              password: credentials.password,
            },
            { skipAuth: true },
          );

          const accessTokenExpiresAt = getTokenExpiry(data.accessToken);
          const refreshTokenExpiresAt = getTokenExpiry(data.refreshToken);

          const { tenantId } = await httpClient.get<AuthMeResponse>(
            EX_USER_PROFILE_URL,
            {
              email: credentials.email,
            },
            {
              headers: {
                Authorization: `Bearer ${data.accessToken}`,
              },
            },
          );

          return {
            id: data.user.id,
            email: data.user.email,
            role: data.user.role ?? null,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            deviceFingerprint: "web",
            tenantId: tenantId ? tenantId : undefined,
            accessTokenExpiresAt,
            refreshTokenExpiresAt,
          };
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }
          throw new Error("Invalid email or password");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const extendedUser = user as ExtendedUser;

        const accessTokenExpiresAt = getTokenExpiry(extendedUser.accessToken);
        const refreshTokenExpiresAt = getTokenExpiry(extendedUser.refreshToken);

        return {
          ...token,
          id: extendedUser.id,
          user: {
            id: extendedUser.id,
            email: extendedUser.email,
            role: extendedUser.role,
            tenantId: extendedUser.tenantId,
          },
          accessToken: extendedUser.accessToken,
          refreshToken: extendedUser.refreshToken,
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
          deviceFingerprint: extendedUser.deviceFingerprint,
          isAuthenticated: true,
          refreshCount: 0,
          createdAt: Date.now(),
        } as ExtendedJWT;
      }

      const extendedToken = token as ExtendedJWT;
      const now = Date.now();

      if (now >= extendedToken.refreshTokenExpiresAt) {
        console.error("[AUTH] Refresh token expired");
        return {
          ...extendedToken,
          error: "RefreshTokenExpired",
        } as ExtendedJWT;
      }

      const shouldRefresh =
        now >= extendedToken.accessTokenExpiresAt - 60 * 1000;

      if (shouldRefresh) {
        try {
          const refreshCount = extendedToken.refreshCount + 1;

          if (refreshCount > 100) {
            console.error("[AUTH] Refresh limit exceeded");
            return {
              ...extendedToken,
              error: "RefreshLimitExceeded",
            } as ExtendedJWT;
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                refreshToken: extendedToken.refreshToken,
                deviceFingerprint: extendedToken.deviceFingerprint,
              }),
            },
          );

          if (!response.ok) {
            throw new Error("Refresh failed");
          }

          const data: RefreshResponse = await response.json();

          console.log("[AUTH] Token refreshed successfully");

          const accessTokenExpiresAt = getTokenExpiry(data.accessToken);
          const refreshTokenExpiresAt = getTokenExpiry(data.refreshToken);

          return {
            ...extendedToken,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            accessTokenExpiresAt,
            refreshTokenExpiresAt,
            refreshCount,
            lastRefreshedAt: Date.now(),
            error: undefined,
          } as ExtendedJWT;
        } catch (error) {
          console.error("[AUTH] Token refresh failed:", error);
          return {
            ...extendedToken,
            error: "RefreshAccessTokenError",
          } as ExtendedJWT;
        }
      }

      return extendedToken;
    },

    // session({ session, token }) {
    //   const extendedToken = token as ExtendedJWT;

    //   if (extendedToken.error) {
    //     session.error = extendedToken.error;
    //   }

    //   // ✅ Ensure user object is fully populated with role
    //   session.user = {
    //     // id: extendedToken.user.id,
    //     email: extendedToken.user.email,
    //     // role: extendedToken.user.role ?? null, // ✅ Explicitly set role
    //     tenantId: extendedToken.user.tenantId ?? undefined
    //   };
    //   session.accessToken = extendedToken.accessToken;
    //   return session;
    // },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };