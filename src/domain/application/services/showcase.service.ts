import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { SHOWCASES_URL } from "@/constants/apis";
import {
  Showcase,
  ShowcaseListResponse,
  ShowcaseResponse,
  CreateShowcasePayload,
  UpdateShowcasePayload,
} from "@/domain/shared/types/showcase.type";

class ShowcaseService {
  async createShowcase(payload: CreateShowcasePayload): Promise<Showcase> {
    try {
      const response = await httpClient.request<ShowcaseResponse>({
        url: `${SHOWCASES_URL}`,
        method: "POST",
        data: payload,
      });

      if (!response || !response.data) {
        throw new Error("Invalid showcase create response");
      }

      return response.data;
    } catch (error) {
      handleApiError(error, "createShowcase");
    }
  }

  async getAllShowcases(): Promise<Showcase[]> {
    try {
      const response: any = await httpClient.request<ShowcaseListResponse>({
        url: `${SHOWCASES_URL}`,
        method: "GET",
      });
      return response;
    } catch (error) {
      handleApiError(error, "getAllShowcases");
    }
  }

  async getActiveShowcases(): Promise<Showcase[]> {
    try {
      const response = await httpClient.request<ShowcaseListResponse>({
        url: `${SHOWCASES_URL}/active`,
        method: "GET",
        skipAuth: true,
      });

      if (!response || !response.data) {
        return [];
      }

      const data: any = response.data;
      return data;
    } catch (error) {
      const status =
        error && typeof error === "object" && "status" in error
          ? (error as { status?: number }).status
          : undefined;
      if (status === 404 || status === 503) {
        return [];
      }
      handleApiError(error, "getActiveShowcases");
      return [];
    }
  }

  async getShowcaseById(id: string): Promise<Showcase> {
    if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("Invalid id");
    }

    try {
      const response = await httpClient.request<ShowcaseResponse>({
        url: `${SHOWCASES_URL}/${id}`,
        method: "GET",
      });

      if (!response || !response.data) {
        throw new Error("Invalid showcase response");
      }

      return response.data;
    } catch (error) {
      handleApiError(error, "getShowcaseById");
    }
  }

  async updateShowcase(
    id: string,
    payload: UpdateShowcasePayload
  ): Promise<Showcase> {
    if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("Invalid id");
    }

    try {
      const response = await httpClient.request<ShowcaseResponse>({
        url: `${SHOWCASES_URL}/${id}`,
        method: "PUT",
        data: payload,
      });

      if (!response || !response.data) {
        throw new Error("Invalid showcase update response");
      }

      return response.data;
    } catch (error) {
      handleApiError(error, "updateShowcase");
    }
  }

  async deleteShowcase(id: string): Promise<string> {
    if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("Invalid id");
    }

    try {
      const response = await httpClient.request<{ message: string }>({
        url: `${SHOWCASES_URL}/${id}`,
        method: "DELETE",
      });

      if (!response || !response.message) {
        throw new Error("Invalid showcase delete response");
      }

      return response.message;
    } catch (error) {
      handleApiError(error, "deleteShowcase");
    }
  }
}

export const showcaseService = new ShowcaseService();
