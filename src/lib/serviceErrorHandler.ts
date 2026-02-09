// lib/serviceErrorHandler.ts
import { AuthError, AuthErrorCode } from "@/domain/application/errors/AuthError";

interface HttpError {
  message: string;
  status?: number;
  data?: {
    message?: string;
    code?: string;
  };
}

function isHttpError(error: unknown): error is HttpError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  );
}

/**
 * Maps HTTP status codes to AuthErrorCode
 */
function getAuthErrorCode(status?: number, backendCode?: string): AuthErrorCode {
  // Check backend error code first
  if (backendCode) {
    const mapping: Record<string, AuthErrorCode> = {
      INVALID_CREDENTIALS: AuthErrorCode.INVALID_CREDENTIALS,
      UNAUTHORIZED: AuthErrorCode.UNAUTHORIZED,
      TOKEN_EXPIRED: AuthErrorCode.REFRESH_TOKEN_EXPIRED,
      REFRESH_FAILED: AuthErrorCode.REFRESH_FAILED,
    };
    
    if (mapping[backendCode]) {
      return mapping[backendCode];
    }
  }

  // Fallback to HTTP status
  switch (status) {
    case 401:
      return AuthErrorCode.INVALID_CREDENTIALS;
    case 408:
    case 504:
      return AuthErrorCode.TIMEOUT;
    case 503:
      return AuthErrorCode.NETWORK_ERROR;
    default:
      return AuthErrorCode.AUTH_FAILED;
  }
}

/**
 * Handles auth-related errors from HTTP calls
 */
export function handleAuthError(error: unknown, context?: string): never {
  // Already an AuthError - just rethrow
  if (error instanceof AuthError) {
    throw error;
  }

  // HTTP error from httpClient
  if (isHttpError(error)) {
    const message = error.data?.message || error.message;
    const code = getAuthErrorCode(error.status, error.data?.code);
    
    throw new AuthError(
      context ? `${message} (${context})` : message,
      code,
      error.data
    );
  }

  // Network/timeout errors
  if (error instanceof Error) {
    if (error.message.includes("timeout") || error.message.includes("ECONNABORTED")) {
      throw new AuthError("Request timeout", AuthErrorCode.TIMEOUT);
    }
    
    if (error.message.includes("Network") || error.message.includes("ECONNREFUSED")) {
      throw new AuthError("Network error", AuthErrorCode.NETWORK_ERROR);
    }
  }

  // Generic fallback
  const message = error instanceof Error ? error.message : "Authentication failed";
  throw new AuthError(
    context ? `${message} (${context})` : message,
    AuthErrorCode.AUTH_FAILED
  );
}