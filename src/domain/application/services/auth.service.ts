// services/auth.service.ts
import { handleAuthError } from "@/lib/serviceErrorHandler";
import { AuthError, AuthErrorCode } from "@/domain/application/errors/AuthError";
import { httpClient } from "@/lib/httpClient";
import { REGISTER_URL, LOGIN_URL, REFRESH_TOKEN_URL } from "@/constants/apis";
import { LoginData, RegisterData } from "@/domain/interfaces/dtos/createUser.dto";

export interface AuthResponse {
  success: boolean;
  data?: {
    statusCode: string;
    message: string;
  },
  timestamp: string;
  accessToken?: string;
  refreshToken?: string;
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await httpClient.request<AuthResponse>({
        url: REGISTER_URL,
        method: "POST",
        data,
        skipAuth: true,
      });

      return response;
    } catch (error) {
      handleAuthError(error, "register");
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await httpClient.request<AuthResponse>({
        url: LOGIN_URL,
        method: "POST",
        data,
        skipAuth: true,
      });

      if (!response.accessToken || !response.refreshToken) {
        throw new AuthError(
          "Invalid login response",
          AuthErrorCode.INVALID_RESPONSE
        );
      }

      return response;
    } catch (error) {
      handleAuthError(error, "login");
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await httpClient.request<AuthResponse>({
        url: REFRESH_TOKEN_URL,
        method: "POST",
        data: { refreshToken },
        skipAuth: true,
      });

      if (!response.accessToken || !response.refreshToken) {
        throw new AuthError(
          "Invalid refresh response",
          AuthErrorCode.INVALID_RESPONSE
        );
      }

      return response;
    } catch (error) {
      handleAuthError(error, "refresh token");
    }
  }
}

export const authService = new AuthService();