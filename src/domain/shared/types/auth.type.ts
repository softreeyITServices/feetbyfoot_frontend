import { type User } from "next-auth";
import { JWT } from "next-auth/jwt";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    tenantId?: string;
  };
}

export interface AuthMeResponse {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

export interface ExtendedUser extends User {
  id: string;
  email: string;
  role: string | null;
  accessToken: string;
  refreshToken: string;
  deviceFingerprint: string;
  tenantId?: string;
}

export interface ExtendedJWT extends JWT {
  id: string;
  user: {
    id: string;
    email: string;
    role: string | null;
    tenantId?: string;
  };
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
  deviceFingerprint: string;
  isAuthenticated: boolean;
  refreshCount: number;
  createdAt: number;
  lastRefreshedAt?: number;

  error?: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  exp: number;
  iat: number;
}