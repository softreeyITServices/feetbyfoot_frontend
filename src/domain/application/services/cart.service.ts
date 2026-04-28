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
  async getCart(paymentMethod?: string): Promise<CartResponse> {
    try {
      const url = paymentMethod ? `${CART_URL}?paymentMethod=${encodeURIComponent(paymentMethod)}` : CART_URL;
      const response = await httpClient.request<CartResponse>({
        url,
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

  /**
   * Removes every line from the server cart (authenticated users).
   * Call after a successful order so Redux `clearCart` is not undone by the next sync.
   */
  async clearAllServerItems(): Promise<void> {
    try {
      const response = await this.getCart();
      const cartItems = response.data?.data?.items ?? [];
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return;
      }

      await this.deleteItems({
        items: cartItems.map((item) => ({
          itemId: item._id,
          productId: item.productId,
          size: item.size,
        })),
      });
    } catch (error) {
      handleApiError(error, "clearAllServerItems");
    }
  }
}

export const cartService = new CartService();
