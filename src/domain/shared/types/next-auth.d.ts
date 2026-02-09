import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken: string;
    error?: string;
    user: {
      id: string;
      email: string;
      role?: string | null;
      tenantId?: string
    };
  }

  interface User extends DefaultUser {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: number;
    refreshTokenExpiresAt: number;
    deviceFingerprint: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: number;
    refreshTokenExpiresAt: number;
    deviceFingerprint: string;
    isAuthenticated?: boolean;
    refreshCount: number;
    createdAt: number;
    lastRefreshedAt?: number;
    user: {
      id: string;
      email: string;
      role?: string | null;
      tenantId?: string
    };
    error?: string;
  }
}