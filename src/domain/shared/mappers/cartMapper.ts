import {
  CartItem as BackendCartItem,
} from "@/domain/shared/types/cart.type";

import {
  CartItem as ReduxCartItem,
} from "@/store/slices/cart.slice";

/**
 * Reads `items` from the cart GET response. Handles:
 * - Next envelope `{ success, data: nest, timestamp }` then Nest `{ data: Cart }`
 * - Cart document attached directly on `data` (`data.items`)
 * - Missing / null `items` (empty cart)
 */
export function getCartItemsFromApiResponse(
  payload: unknown
): BackendCartItem[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const data = root.data;
  if (!data || typeof data !== "object") return [];
  const layer = data as Record<string, unknown>;

  const inner = layer.data;
  if (inner && typeof inner === "object") {
    const items = (inner as Record<string, unknown>).items;
    if (Array.isArray(items)) return items as BackendCartItem[];
  }

  if (Array.isArray(layer.items)) return layer.items as BackendCartItem[];

  return [];
}

export const mapBackendCartToRedux = (
  backendItems: BackendCartItem[] | undefined | null
): ReduxCartItem[] => {
  if (!Array.isArray(backendItems)) return [];
  return backendItems.map((item) => ({
    id: item.productId,
    itemId: item._id,
    name: item.productName,
    image: item.productImage,
    price: item.unitPrice,
    size: item.size,
    quantity: item.quantity,
  }));
};

/** Use with the raw value returned from `cartService.getCart()`. */
export function mapCartApiResponseToRedux(
  response: unknown
): ReduxCartItem[] {
  return mapBackendCartToRedux(getCartItemsFromApiResponse(response));
}
