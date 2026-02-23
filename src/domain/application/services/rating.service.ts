import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { RATING_URL } from "@/constants/apis";
import {
  CreateRatingPayload,
  CreateRatingResponse,
  GetRatingApiResponse,
  GetRatingResponse,
} from "@/domain/shared/types/rating.type";

class RatingService {
  /* ---------------- CREATE RATING (Auth Required) ---------------- */
  async createRating(
    payload: CreateRatingPayload
  ): Promise<CreateRatingResponse> {
    try {
      const response = await httpClient.request<CreateRatingResponse>({
        url: RATING_URL,
        method: "POST",
        data: payload,
        requiresAuth: true,
      });

      if (!response) {
        throw new Error("Invalid rating response");
      }

      return response;
    } catch (error) {
      handleApiError(error, "createRating");
    }
  }

  /* ---------------- GET RATING BY PRODUCT ID (Public) ---------------- */
  async getRatingsByProductId(
    productId: string
  ): Promise<GetRatingResponse> {
    try {
      const {data} = await httpClient.request<GetRatingApiResponse>({
        url: `${RATING_URL}/${productId}`,
        method: "GET",
        skipAuth: true,
      });

      if (!data) {
        throw new Error("Invalid rating fetch response");
      }

      return data;
    } catch (error) {
      handleApiError(error, "getRatingsByProductId");
    }
  }

  /* ---------------- UPDATE RATING (Auth Required) ---------------- */
  async updateRating(
    id: string,
    payload: CreateRatingPayload
  ): Promise<CreateRatingResponse> {
    try {
      const response = await httpClient.request<CreateRatingResponse>({
        url: `${RATING_URL}/${id}`,
        method: "PATCH",
        data: payload,
        requiresAuth: true,
      });

      if (!response) {
        throw new Error("Invalid update rating response");
      }

      return response;
    } catch (error) {
      handleApiError(error, "updateRating");
    }
  }
}

export const ratingService = new RatingService();