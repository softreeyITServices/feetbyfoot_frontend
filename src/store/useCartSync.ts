"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "@/store/hooks";
import { setAuthMode, setCart } from "@/store/slices/cart.slice";
import { loadCartFromStorage } from "@/store/utils/cartStorage";
import { cartService } from "@/domain/application/services/cart.service";
import { mapBackendCartToRedux } from "@/domain/shared/mappers/cartMapper";

export function useCartSync() {
  const { status } = useSession();
  const dispatch = useAppDispatch();


  useEffect(() => {
    const syncCart = async () => {
      if (status === "loading") return;

      if (status !== "authenticated") {
        dispatch(setAuthMode(false));
        return;
      }

      dispatch(setAuthMode(true));

      try {
        const guestCart = loadCartFromStorage();

        // 🔥 Merge guest cart once on login
        if (guestCart.length > 0) {
          for (const item of guestCart) {
            await cartService.addItem({
              productId: item.id,
              size: item.size,
              quantity: item.quantity,
            });
          }

          localStorage.removeItem("cart_items");
        }

        // 🔥 Fetch backend cart ONCE
        const dbCart = await cartService.getCart();

        dispatch(
          setCart(mapBackendCartToRedux(dbCart.data.data.items))
        );

      } catch (error) {
        console.error("Cart sync failed:", error);
      }
    };

    syncCart();
  }, [status]);
}
