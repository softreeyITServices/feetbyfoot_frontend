import { RequestOptions } from "@/domain/shared/types/httpRequest.type";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import type { Session } from "next-auth";

const isBrowser = typeof window !== "undefined";

class HttpClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL = isBrowser ? "" : process.env.NEXT_PUBLIC_API_URL || "";

    this.client = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    this.client.interceptors.request.use(
      async (config) => {
        if (config.headers?.["X-Skip-Auth"]) {
          delete config.headers["X-Skip-Auth"];
          return config;
        }

        if (!isBrowser && config.headers?.["X-Server-Token"]) {
          const token = config.headers["X-Server-Token"] as string;
          delete config.headers["X-Server-Token"];
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        }
        if (!isBrowser) return config;
        const requiresAuth = config.headers?.["X-Requires-Auth"] === "true";

        if (requiresAuth) {
          delete config.headers["X-Requires-Auth"];
        }

        if (!requiresAuth) {
          return config;
        }

        try {
          const { getSession } = await import("next-auth/react");
          const session = await getSession();

          const errorCode = (session as Session)?.error;

          if (
            errorCode === "RefreshTokenExpired" ||
            errorCode === "DeviceMismatch" ||
            errorCode === "TokenTooOld" ||
            errorCode === "RefreshLimitExceeded" ||
            errorCode === "MissingTokens"
          ) {
            const { signOut } = await import("next-auth/react");
            await signOut({
              redirect: true,
              callbackUrl: "/",
            });
            throw new Error("Session expired");
          }

          const accessToken = (session as Session & { accessToken?: string })
            ?.accessToken;

          if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
          }
        } catch (err) {
          console.error("[HTTP] Request interceptor error:", err);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response.data,
      async (error) => {
        const status = error.response?.status;
        const responseMessage = error.response?.data?.message;
        const normalizedMessage =
          typeof responseMessage === "string"
            ? responseMessage
            : error.message || "Request failed";

        const requiresAuth =
          error.config?.headers?.["X-Requires-Auth"] === "true";

        if (status === 401 && isBrowser && requiresAuth) {
          const { signOut } = await import("next-auth/react");
          await signOut({
            redirect: true,
            callbackUrl: "/",
          });
        }

        return Promise.reject({
          message: normalizedMessage,
          status,
          data: error.response?.data,
        });
      }
    );
  }

  async request<T = unknown>({
    url,
    method = "GET",
    data,
    params,
    headers,
    skipAuth = false,
    requiresAuth = false,
    token,
    responseType
  }: RequestOptions): Promise<T> {

    const isFormData =
      typeof FormData !== "undefined" && data instanceof FormData;

    const config: AxiosRequestConfig = {
      url,
      method,
      data,
      params,
      responseType,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...headers,
        ...(skipAuth && { "X-Skip-Auth": "true" }),
        ...(requiresAuth && { "X-Requires-Auth": "true" }),
        ...(token && { "X-Server-Token": token }),
      },
    };

    return this.client.request<T, T>(config);
  }

  get<T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    options?: Partial<RequestOptions>
  ) {
    return this.request<T>({ url, method: "GET", params, ...options });
  }

  post<T = unknown>(
    url: string,
    data?: unknown,
    options?: Partial<RequestOptions>
  ) {
    return this.request<T>({ url, method: "POST", data, ...options });
  }

  put<T = unknown>(
    url: string,
    data?: unknown,
    options?: Partial<RequestOptions>
  ) {
    return this.request<T>({ url, method: "PUT", data, ...options });
  }

  patch<T = unknown>(
    url: string,
    data?: unknown,
    options?: Partial<RequestOptions>
  ) {
    return this.request<T>({ url, method: "PATCH", data, ...options });
  }

  delete<T = unknown>(url: string, options?: Partial<RequestOptions>) {
    return this.request<T>({ url, method: "DELETE", ...options });
  }
}

export const httpClient = new HttpClient();
