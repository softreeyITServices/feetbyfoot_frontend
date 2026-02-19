// services/auth.service.ts
import { handleAuthError } from "@/lib/serviceErrorHandler";
import { AuthError, AuthErrorCode } from "@/domain/application/errors/AuthError";
import { httpClient } from "@/lib/httpClient";
import {
  REGISTER_URL,
  VERIFY_OTP_URL,
  REFRESH_TOKEN_URL,
  SEND_OTP_URL,
  UPDATE_PROFILE_URL,
} from "@/constants/apis";
import {
  LoginData,
  RegisterData,
} from "@/domain/interfaces/dtos/createUser.dto";

/**
 * Used only for non-NextAuth flows (register, send otp, refresh)
 * OTP verification is handled by NextAuth Credentials provider
 */
export interface AuthResponse {
  success: boolean;
  data?: {
    statusCode: string;
    message: string;
  };
  timestamp: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface SendOtpPayload {
  identifier: string; // email or phone
  type: "email" | "phone";
}

// Add this interface
export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
}


class AuthService {
  /**
   * Register user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      return await httpClient.request<AuthResponse>({
        url: REGISTER_URL,
        method: "POST",
        data,
        skipAuth: true,
      });
    } catch (error) {
      handleAuthError(error, "register");
      throw error;
    }
  }

  /**
   * Password based login (if still needed)
   * OTP login is handled via NextAuth
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await httpClient.request<AuthResponse>({
        url: VERIFY_OTP_URL,
        method: "POST",
        data,
        skipAuth: true,
      });

      if (!response.accessToken || !response.refreshToken) {
        throw new AuthError(
          "Invalid login response",
          AuthErrorCode.INVALID_RESPONSE,
        );
      }

      return response;
    } catch (error) {
      handleAuthError(error, "login");
      throw error;
    }
  }

  /**
   * Send OTP (email / phone)
   */
  async sendOtp(payload: SendOtpPayload): Promise<AuthResponse> {
    try {
      return await httpClient.request<AuthResponse>({
        url: SEND_OTP_URL,
        method: "POST",
        data: payload,
        skipAuth: true,
      });
    } catch (error) {
      handleAuthError(error, "send otp");
      throw error;
    }
  }

  /**
   * Refresh token (used internally or outside NextAuth if needed)
   */
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
          AuthErrorCode.INVALID_RESPONSE,
        );
      }

      return response;
    } catch (error) {
      handleAuthError(error, "refresh token");
      throw error;
    }
  }

  /**
 * Update user profile
 */
  async updateProfile(
    payload: UpdateProfilePayload
  ): Promise<AuthResponse> {
    try {
      return await httpClient.request<AuthResponse>({
        url: UPDATE_PROFILE_URL,
        method: "PATCH",
        data: payload,
        requiresAuth: true,
      });
    } catch (error) {
      handleAuthError(error, "update profile");
      throw error;
    }
  }

}



export const authService = new AuthService();
