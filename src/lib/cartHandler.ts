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
  // 1. Optimistic Update (Instant UI change)
  onLocalUpdate();

  // 2. Background Sync
  if (isAuthenticated && itemId) {
    try {
      await cartService.updateItem(itemId, {
        productId: id,
        size,
        quantity: quantity + 1,
      });
      await refreshBackend();
    } catch (error) {
      console.error("Failed to sync cart increase:", error);
      // Rollback would happen on the next refreshBackend or page reload
    }
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

  // 1. Optimistic Update
  onLocalUpdate();

  if (isAuthenticated && itemId) {
    try {
      await cartService.updateItem(itemId, {
        productId: id,
        size,
        quantity: quantity - 1,
      });
      await refreshBackend();
    } catch (error) {
      console.error("Failed to sync cart decrease:", error);
    }
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
  // 1. Optimistic Update
  onLocalUpdate();

  if (isAuthenticated) {
    try {
      await cartService.deleteItems({
        items: [{ 
          productId: id,
          size,
          ...(itemId ? { itemId } : {})
        }],
      });
      await refreshBackend();
    } catch (error) {
      console.error("Failed to sync cart removal:", error);
    }
  }
};
