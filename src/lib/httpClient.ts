import { RequestOptions } from "@/domain/shared/types/httpRequest.type";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import type { Session } from "next-auth";

const isBrowser = typeof window !== "undefined";

class HttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "",
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
            errorCode === "RefreshLimitExceeded"
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
          message:
            error.response?.data?.message ||
            error.message ||
            "Request failed",
          status,
          data: error.response?.data,
        });
      }
    );
  }

  private buildServerUrl(
    url: string,
    params?: Record<string, unknown>
  ): string {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
    const resolved = url.startsWith("http")
      ? new URL(url)
      : new URL(url, baseURL.endsWith("/") ? baseURL : `${baseURL}/`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
          value.forEach((item) => resolved.searchParams.append(key, String(item)));
        } else {
          resolved.searchParams.set(key, String(value));
        }
      });
    }

    return resolved.toString();
  }

  private async requestOnServer<T = unknown>({
    url,
    method = "GET",
    data,
    params,
    headers,
    skipAuth = false,
    token,
  }: RequestOptions): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const upperMethod = method.toUpperCase();
    const isFormData =
      typeof FormData !== "undefined" && data instanceof FormData;

    const requestHeaders: Record<string, string> = {
      ...headers,
    };

    if (!isFormData && data !== undefined) {
      requestHeaders["Content-Type"] =
        requestHeaders["Content-Type"] || "application/json";
    }

    if (!skipAuth && token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    delete requestHeaders["X-Skip-Auth"];
    delete requestHeaders["X-Requires-Auth"];
    delete requestHeaders["X-Server-Token"];

    const requestInit: RequestInit = {
      method: upperMethod,
      headers: requestHeaders,
      signal: controller.signal,
    };

    if (data !== undefined && upperMethod !== "GET" && upperMethod !== "HEAD") {
      requestInit.body = isFormData ? (data as FormData) : JSON.stringify(data);
    }

    try {
      const response = await fetch(this.buildServerUrl(url, params), requestInit);
      const raw = await response.text();
      const parsed = raw ? JSON.parse(raw) : null;

      if (!response.ok) {
        return Promise.reject({
          message:
            parsed?.message || response.statusText || "Request failed",
          status: response.status,
          data: parsed,
        });
      }

      return parsed as T;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return Promise.reject({
          message: "Request timeout",
          status: 408,
          data: null,
        });
      }

      return Promise.reject({
        message: error instanceof Error ? error.message : "Request failed",
        status: undefined,
        data: null,
      });
    } finally {
      clearTimeout(timeout);
    }
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
    if (!isBrowser) {
      return this.requestOnServer<T>({
        url,
        method,
        data,
        params,
        headers,
        skipAuth,
        token,
      });
    }

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
