import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken: string;
    error?: string;
    user: {
      id: string;
      role: string;
      name: string;
      email: string;
      phone: string;
    };
  };
}

interface User {
  id: string;
  role: string;
  name: string;
  email: string;
  phone: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
  deviceFingerprint: string;
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    user: {
      id: string;
      role: string;
      name: string;
      email: string;
      phone: string;
    };
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: number;
    refreshTokenExpiresAt: number;
    refreshCount: number;
    deviceFingerprint: string;
    createdAt: number;
    lastRefreshedAt?: number;
    isAuthenticated: boolean;
    error?: string;
  }
}
