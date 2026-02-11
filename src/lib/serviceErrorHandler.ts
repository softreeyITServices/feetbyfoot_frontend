// lib/serviceErrorHandler.ts
import { AuthError, AuthErrorCode } from "@/domain/application/errors/AuthError";

interface HttpError {
  message: string;
  status?: number;
  data?: {
    message?: string;
    code?: string;
    errors?: Record<string, string[]>; // ✅ ADD THIS
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


export function handleApiError(error: unknown, context?: string): never {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    const err = error as {
      message: string;
      status?: number;
      data?: unknown;
    };

    const message = context
      ? `${err.message} (${context})`
      : err.message;

    throw Object.assign(new Error(message), {
      status: err.status,
      data: err.data,
    });
  }

  const message =
    error instanceof Error ? error.message : "Something went wrong";

  throw new Error(context ? `${message} (${context})` : message);
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
    // ✅ If this is a validation error with field-specific errors, just rethrow it as-is
    // Let the component handle field errors directly
    if (error.data?.code === "VALIDATION_ERROR" && error.data?.errors) {
      throw error; // Rethrow the original error object
    }

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