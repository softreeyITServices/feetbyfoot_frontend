// lib/apiHandler.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApplicationError } from "@/domain/application/errors/ApplicationError";
import {
  ApiHandler,
  ApiHandlerOptions,
} from "@/domain/shared/types/apiResponse.type";
import { MAX_BODY_SIZE, REQUEST_TIMEOUT } from "@/constants/basic";

/* ======================================================
   API HANDLER
====================================================== */

export function apiHandler<T = unknown>(
  handler: ApiHandler<T>,
  options?: ApiHandlerOptions<T>
) {
  return async (req: NextRequest, context: { params: Promise<Record<string, string>> }): Promise<NextResponse> => {
    const startTime = Date.now();
    const path = req.nextUrl.pathname;
    const method = req.method;

    try {
      if (
        options?.allowedMethods &&
        !options.allowedMethods.includes(method)
      ) {
        throw new MethodNotAllowedError(`Method ${method} not allowed`);
      }

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new TimeoutError()), REQUEST_TIMEOUT);
      });

      const resolvedParams =
        context?.params instanceof Promise
          ? await context.params
          : context?.params;

      const handlerPromise = executeHandler(req, handler, options, resolvedParams);

      const response = await Promise.race([
        handlerPromise,
        timeoutPromise,
      ]);

      addSecurityHeaders(response);

      logRequest(
        method,
        path,
        response.status,
        Date.now() - startTime
      );

      return response;
    } catch (error) {
      logError(method, path, error);

      const response = handleError(error, path);

      addSecurityHeaders(response);
      return response;
    }
  };
}

/* ======================================================
   EXECUTE HANDLER
====================================================== */

async function executeHandler<T>(
  req: NextRequest,
  handler: ApiHandler<T>,
  options: ApiHandlerOptions<T> | undefined,
  params?: Record<string, string>
): Promise<NextResponse> {
  let validatedData: T | null = null;

  if (options?.schema) {
    const contentType = req.headers.get("content-type") ?? "";

    if (
      ["POST", "PUT", "PATCH"].includes(req.method) &&
      !contentType.includes("application/json")
    ) {
      throw new UnsupportedMediaTypeError(
        "Content-Type must be application/json"
      );
    }

    const text = await req.text();

    const bodySize = new TextEncoder().encode(text).length;
    const maxSize = options.maxBodySize ?? MAX_BODY_SIZE;

    if (bodySize > maxSize) {
      throw new PayloadTooLargeError();
    }

    let body: unknown = {};

    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        throw new BadRequestError("Invalid JSON");
      }
    }

    try {
      validatedData = options.schema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) throw err;
      throw new BadRequestError("Validation failed");
    }
  }

  return handler(req, {
    data: validatedData as T,
    req,
    params
  });
}

/* ======================================================
   ERROR HANDLING
====================================================== */

function handleError(error: unknown, path?: string): NextResponse {
  const timestamp = new Date().toISOString();
  const isDev = process.env.NODE_ENV === "development";

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
        code: "VALIDATION_ERROR",
        timestamp,
        path,
      },
      { status: 400 }
    );
  }

  /* ✅ EXTERNAL API ERROR HANDLING */
  if (error instanceof ExternalApiError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        code: error.code,
        ...(isDev && typeof error.payload === "object" && error.payload !== null
          ? { details: error.payload }
          : {}),
        timestamp,
        path,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ApplicationError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        code: error.code,
        timestamp,
        path,
        ...(isDev && error.stack && { stack: error.stack }),
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof TimeoutError) {
    return NextResponse.json(
      {
        success: false,
        message: "Request timeout",
        code: "TIMEOUT_ERROR",
        timestamp,
        path,
      },
      { status: 504 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      message:
        isDev && error instanceof Error
          ? sanitizeErrorMessage(error.message)
          : "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
      timestamp,
      path,
      ...(isDev &&
        error instanceof Error &&
        error.stack && { stack: error.stack }),
    },
    { status: 500 }
  );
}

/* ======================================================
   HELPERS
====================================================== */

function sanitizeErrorMessage(message: string): string {
  return message
    .replace(/Bearer\s+[\w.-]+/gi, "Bearer [TOKEN]")
    .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, "[EMAIL]")
    .substring(0, 500);
}

function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );
  response.headers.delete("X-Powered-By");
}

function logRequest(
  method: string,
  path: string,
  status: number,
  duration: number
) {
  const logger =
    status >= 500
      ? console.error
      : status >= 400
        ? console.warn
        : console.info;

  logger(
    JSON.stringify({
      type: "request",
      method,
      path,
      status,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    })
  );
}

function logError(method: string, path: string, error: unknown) {
  console.error(
    JSON.stringify({
      type: "error",
      method,
      path,
      message:
        error instanceof Error
          ? sanitizeErrorMessage(error.message)
          : "Unknown error",
      ...(process.env.NODE_ENV === "development" &&
        error instanceof Error && { stack: error.stack }),
      timestamp: new Date().toISOString(),
    })
  );
}

/* ======================================================
   SUCCESS RESPONSE
====================================================== */

export function createSuccessResponse<T>(
  data: T,
  status = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/* ======================================================
   ERROR CLASSES
====================================================== */

class TimeoutError extends Error {
  constructor() {
    super("Request timeout");
    this.name = "TimeoutError";
  }
}

class MethodNotAllowedError extends ApplicationError {
  readonly statusCode = 405;

  constructor(message = "Method not allowed") {
    super(message, "METHOD_NOT_ALLOWED");
    this.name = "MethodNotAllowedError";
  }
}

class PayloadTooLargeError extends ApplicationError {
  readonly statusCode = 413;

  constructor(message = "Payload too large") {
    super(message, "PAYLOAD_TOO_LARGE");
    this.name = "PayloadTooLargeError";
  }
}

class UnsupportedMediaTypeError extends ApplicationError {
  readonly statusCode = 415;

  constructor(message = "Unsupported media type") {
    super(message, "UNSUPPORTED_MEDIA_TYPE");
    this.name = "UnsupportedMediaTypeError";
  }
}

export class BadRequestError extends ApplicationError {
  readonly statusCode = 400;

  constructor(message = "Bad request") {
    super(message, "BAD_REQUEST");
    this.name = "BadRequestError";
  }
}

/* ======================================================
   EXTERNAL API ERROR
====================================================== */

export class ExternalApiError extends ApplicationError {
  readonly statusCode: number;
  payload?: unknown;

  constructor(
    message: string,
    statusCode = 502,
    payload?: unknown
  ) {
    super(message, "EXTERNAL_API_ERROR");
    this.statusCode = statusCode;
    this.payload = payload;
    this.name = "ExternalApiError";
  }
}

