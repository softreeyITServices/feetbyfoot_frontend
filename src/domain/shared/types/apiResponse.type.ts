import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";

export type ApiHandler<
  T = unknown,
  P = Record<string, string>
> = (
  req: NextRequest,
  context: ApiContext<T, P>
) => Promise<NextResponse> | NextResponse;

export interface ApiHandlerOptions<T> {
  schema?: ZodSchema<T>;
  requiresAuth?: boolean;
  maxBodySize?: number; // bytes
  allowedMethods?: string[];
}

export interface ApiContext<T = unknown, P = Record<string, string>> {
  data: T;
  req: NextRequest;
  params?: P;
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