import { httpClient } from "@/lib/httpClient";
import type { AdminCategory } from "@/domain/shared/types/admin/category";

// This hits: `${NEXT_PUBLIC_API_URL}/v1/Categories`
const BASE_URL = "/Categories";

export interface CategoryPayload {
  name: string;
  isActive?: boolean;
}

export interface CategoryListResponse {
  message: string;
  data: AdminCategory[];
}

export async function fetchCategories(
  token?: string
): Promise<CategoryListResponse> {
  return httpClient.get<CategoryListResponse>(BASE_URL, undefined, {
    token,
  });
}

export async function createCategory(
  payload: CategoryPayload,
  token?: string
): Promise<void> {
  await httpClient.post<unknown>(BASE_URL, payload, {
    requiresAuth: true,
    token,
  });
}

export async function updateCategory(
  id: string,
  payload: CategoryPayload,
  token?: string
): Promise<void> {
  await httpClient.patch<unknown>(`${BASE_URL}/${id}`, payload, {
    requiresAuth: true,
    token,
  });
}

export async function deleteCategory(id: string, token?: string): Promise<void> {
  await httpClient.delete<unknown>(`${BASE_URL}/${id}`, {
    requiresAuth: true,
    token,
  });
}

