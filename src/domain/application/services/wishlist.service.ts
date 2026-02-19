import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { WISHLIST_URL } from "@/constants/apis";
import {
  WishlistResponse,
  AddToWishlistRequest,
} from "@/domain/shared/types/wishlist.type";

class WishlistService {
  /* ---------------- ADD TO WISHLIST ---------------- */
  async addToWishlist(
    payload: AddToWishlistRequest
  ): Promise<WishlistResponse> {
    try {
      const response = await httpClient.request<WishlistResponse>({
        url: WISHLIST_URL,
        method: "POST",
        requiresAuth: true,
        data: payload,
      });

      return response;
    } catch (error) {
      handleApiError(error, "addToWishlist");
      throw error;
    }
  }

  /* ---------------- GET WISHLIST ---------------- */
  async getWishlist(): Promise<WishlistResponse> {
    try {
      const response = await httpClient.request<WishlistResponse>({
        url: WISHLIST_URL,
        method: "GET",
        requiresAuth: true,
      });

      return response;
    } catch (error) {
      handleApiError(error, "getWishlist");
      throw error;
    }
  }

  /* ---------------- REMOVE FROM WISHLIST ---------------- */
  async removeFromWishlist(productId: string): Promise<WishlistResponse> {
    try {
      const response = await httpClient.request<WishlistResponse>({
        url: `${WISHLIST_URL}/${productId}`,
        method: "DELETE",
        requiresAuth: true,
      });

      return response;
    } catch (error) {
      handleApiError(error, "removeFromWishlist");
      throw error;
    }
  }
}

export const wishlistService = new WishlistService();
