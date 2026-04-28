"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "@/store/hooks";
import { setAuthMode, setCart } from "@/store/slices/cart.slice";
import { loadCartFromStorage } from "@/store/utils/cartStorage";
import { cartService } from "@/domain/application/services/cart.service";
import { mapCartApiResponseToRedux } from "@/domain/shared/mappers/cartMapper";

export function useCartSync() {
  const { status, data: session } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const syncCart = async () => {
      if (status === "loading") return;

      // 🔥 Not logged in
      if (status !== "authenticated") {
        dispatch(setAuthMode(false));
        return;
      }

      // 🔥 ADMIN should NEVER sync cart
      if (session?.user?.role !== "customer") {
        dispatch(setAuthMode(false));
        return;
      }

      dispatch(setAuthMode(true));

      try {
        const guestCart = loadCartFromStorage();

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

        const dbCart = await cartService.getCart();
        console.log("dbCart", dbCart);

        dispatch(setCart(mapCartApiResponseToRedux(dbCart)));
      } catch (error) {
        console.error("Cart sync failed:", error);
      }
    };

    syncCart();
  }, [status, session]);
}
