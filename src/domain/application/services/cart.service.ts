import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { CART_URL } from "@/constants/apis";
import {
  AddToCartRequest,
  UpdateCartItemRequest,
  DeleteCartItemsRequest,
  CartResponse,
} from "@/domain/shared/types/cart.type";

class CartService {
  /* ---------------- GET CART ---------------- */
  async getCart(): Promise<CartResponse> {
    try {
      const response = await httpClient.request<CartResponse>({
        url: CART_URL,
        method: "GET",
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      handleApiError(error, "getCart");
    }
  }

  /* ---------------- ADD ITEM ---------------- */
  async addItem(payload: AddToCartRequest): Promise<CartResponse> {
    try {
      const response = await httpClient.request<CartResponse>({
        url: `${CART_URL}/items`,
        method: "POST",
        requiresAuth: true,
        data: payload,
      });

      return response;
    } catch (error) {
      handleApiError(error, "addItem");
    }
  }

  /* ---------------- UPDATE ITEM ---------------- */
  async updateItem(
    itemId: string,
    payload: UpdateCartItemRequest
  ): Promise<CartResponse> {
    try {
      const response = await httpClient.request<CartResponse>({
        url: `${CART_URL}/items/${itemId}`,
        method: "PATCH",
        requiresAuth: true,
        data: payload,
      });

      return response;
    } catch (error) {
      handleApiError(error, "updateItem");
    }
  }

  /* ---------------- DELETE ITEMS ---------------- */
  async deleteItems(
    payload: DeleteCartItemsRequest
  ): Promise<CartResponse> {
    try {
      const response = await httpClient.request<CartResponse>({
        url: CART_URL,
        method: "DELETE",
        requiresAuth: true,
        data: payload,
      });

      return response;
    } catch (error) {
      handleApiError(error, "deleteItems");
    }
  }
}

export const cartService = new CartService();
