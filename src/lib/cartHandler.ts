import { cartService } from "@/domain/application/services/cart.service";

interface CartActionParams {
  id: string;
  size: string;
  quantity?: number;
  itemId?: string;
  isAuthenticated: boolean;
  onLocalUpdate: () => void;
  refreshBackend: () => Promise<void>;
}

/* ---------------- INCREASE ---------------- */
export const handleIncreaseCart = async ({
  id,
  size,
  quantity = 1,
  itemId,
  isAuthenticated,
  onLocalUpdate,
  refreshBackend,
}: CartActionParams) => {
  if (isAuthenticated && itemId) {
    await cartService.updateItem(itemId, {
      productId: id,
      size,
      quantity: quantity + 1,
    });

    await refreshBackend();
  } else {
    onLocalUpdate();
  }
};

/* ---------------- DECREASE ---------------- */
export const handleDecreaseCart = async ({
  id,
  size,
  quantity = 1,
  itemId,
  isAuthenticated,
  onLocalUpdate,
  refreshBackend,
}: CartActionParams) => {
  if (quantity <= 1) return;

  if (isAuthenticated && itemId) {
    await cartService.updateItem(itemId, {
      productId: id,
      size,
      quantity: quantity - 1,
    });

    await refreshBackend();
  } else {
    onLocalUpdate();
  }
};

/* ---------------- REMOVE ---------------- */
export const handleRemoveCart = async ({
  id,
  size,
  itemId,
  isAuthenticated,
  onLocalUpdate,
  refreshBackend,
}: CartActionParams) => {
  if (isAuthenticated && itemId) {
    await cartService.deleteItems({
      items: [
        {
          productId: id,
          size,
          itemId,
        },
      ],
    });

    await refreshBackend();
  } else {
    onLocalUpdate();
  }
};
