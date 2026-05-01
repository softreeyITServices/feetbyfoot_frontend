export type HttpClientError = {
  message: string;
  status: number;
  method?: string;
  data?: {
    message?: string;
    statusCode?: string;
  };
};

export function isHttpClientError(
  error: unknown
): error is HttpClientError {
  if (typeof error !== "object" || error === null) return false;

  const e = error as Record<string, unknown>;

  if (typeof e.message !== "string") return false;

  // status may be undefined for network-level errors (no HTTP response)
  if ("status" in e && e.status !== undefined && typeof e.status !== "number")
    return false;

  return "status" in e && "message" in e;
}

export function isGetRequestError(error: unknown): boolean {
  return (
    isHttpClientError(error) &&
    typeof error.method === "string" &&
    error.method.toUpperCase() === "GET"
  );
}
