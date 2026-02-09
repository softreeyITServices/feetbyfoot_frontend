// core/application/errors/AuthError.ts

export enum AuthErrorCode {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  AUTH_FAILED = "AUTH_FAILED",
  REFRESH_FAILED = "REFRESH_FAILED",
  REFRESH_TOKEN_EXPIRED = "REFRESH_TOKEN_EXPIRED",
  DEVICE_MISMATCH = "DEVICE_MISMATCH",
  REFRESH_LIMIT_EXCEEDED = "REFRESH_LIMIT_EXCEEDED",
  TOKEN_TOO_OLD = "TOKEN_TOO_OLD",
  INVALID_RESPONSE = "INVALID_RESPONSE",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",
  UNAUTHORIZED = "UNAUTHORIZED",
}

export class AuthError extends Error {
  public readonly code: AuthErrorCode;
  public readonly statusCode?: number;
  public readonly metadata?: Record<string, unknown>;

  constructor(
    message: string,
    code: AuthErrorCode = AuthErrorCode.AUTH_FAILED,
    metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.metadata = metadata;
    this.statusCode = typeof metadata?.status === "number" ? metadata.status : undefined;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }

    Object.setPrototypeOf(this, AuthError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      metadata: this.metadata,
    };
  }
}

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AuthErrorCode.INVALID_CREDENTIALS]: "Invalid email or password",
  [AuthErrorCode.AUTH_FAILED]: "Authentication failed. Please try again.",
  [AuthErrorCode.REFRESH_FAILED]: "Failed to refresh session. Please sign in again.",
  [AuthErrorCode.REFRESH_TOKEN_EXPIRED]: "Your session has expired. Please sign in again.",
  [AuthErrorCode.DEVICE_MISMATCH]: "Device mismatch detected. Please sign in again.",
  [AuthErrorCode.REFRESH_LIMIT_EXCEEDED]: "Too many refresh attempts. Please sign in again.",
  [AuthErrorCode.TOKEN_TOO_OLD]: "Session expired. Please sign in again.",
  [AuthErrorCode.INVALID_RESPONSE]: "Invalid response from server",
  [AuthErrorCode.NETWORK_ERROR]: "Network error. Please check your connection.",
  [AuthErrorCode.TIMEOUT]: "Request timeout. Please try again.",
  [AuthErrorCode.UNAUTHORIZED]: "Unauthorized access",
};

export function getAuthErrorMessage(code: AuthErrorCode): string {
  return AUTH_ERROR_MESSAGES[code] || "An unexpected error occurred";
}
