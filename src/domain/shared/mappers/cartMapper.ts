import {
  CartItem as BackendCartItem,
} from "@/domain/shared/types/cart.type";

import {
  CartItem as ReduxCartItem,
} from "@/store/slices/cart.slice";

export const mapBackendCartToRedux = (
  backendItems?: BackendCartItem[] | null
): ReduxCartItem[] => {
  return (backendItems ?? []).map((item) => ({
    id: item.productId,
    itemId: item._id,
    name: item.productName,
    image: item.productImage,
    price: item.unitPrice,
    size: item.size,
    quantity: item.quantity,
  }));
};
