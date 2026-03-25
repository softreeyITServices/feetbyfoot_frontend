import { User } from "next-auth";

export type UserProfile = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  brandId?: string;
  brand?: {
    _id?: string;
    id?: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type AuthMeResponse = {
  data: UserProfile;
};

export type VerifyOtpResponse = {
  success: boolean;
  data: {
    statusCode: number;
    message: string;
    accessToken: string;
    refreshToken: string;
  },
  timeStamp: string;

};

export type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

export type JWTPayload = {
  exp: number;
  sub: string;
  role?: string;
};

export interface ExtendedUser extends User {
  id: string;
  role: string;
  name: string;
  email: string;
  phone: string;
  brandId?: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
  deviceFingerprint: string;
}

export type ExtendedJWT = {
  id: string;
  user: {
    id: string;
    role: string;
    name: string;
    email: string;
    phone: string;
    brandId?: string;
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
};
