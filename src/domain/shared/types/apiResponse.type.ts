import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";

export type ApiHandler<T = unknown> = (
  req: NextRequest,
  context: ApiContext<T>
) => Promise<NextResponse> | NextResponse;

export interface ApiHandlerOptions<T> {
  schema?: ZodSchema<T>;
  requiresAuth?: boolean;
  maxBodySize?: number; // bytes
  allowedMethods?: string[];
}

export interface ApiContext<T = unknown> {
  data: T;
  req: NextRequest;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: unknown;
  code?: string;
  timestamp: string;
  path?: string;
  stack?: string;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}