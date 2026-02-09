import { AxiosRequestConfig, Method } from "axios";

export interface RequestOptions {
  url: string;
  method?: Method;
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  requiresAuth?: boolean;
  token?: string;
  responseType?: AxiosRequestConfig["responseType"];
}
