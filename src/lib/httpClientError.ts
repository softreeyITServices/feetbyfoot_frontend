export type HttpClientError = {
  message: string;
  status: number;
  data?: {
    message?: string;
    statusCode?: string;
  };
};

export function isHttpClientError(
  error: unknown
): error is HttpClientError {
  if (typeof error !== "object" || error === null) return false;

  return (
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  );
}
