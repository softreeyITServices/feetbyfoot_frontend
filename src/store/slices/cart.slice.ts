import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  loadCartFromStorage,
  saveCartToStorage,
} from "@/store/utils/cartStorage";
import { cartService } from "@/domain/application/services/cart.service";
import { RootState } from "@/store";
import { getSession } from "next-auth/react";
import { mapCartApiResponseToRedux } from "@/domain/shared/mappers/cartMapper";

export type CartItem = {
  id: string; // productId
  itemId?: string; // 🔥 backend _id
  name: string;
  image: string;
  price: string | number;
  size: string;
  color?: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isAuthenticatedMode: boolean; // 🔥 important
};

const initialState: CartState = {
  items: loadCartFromStorage(),
  isAuthenticatedMode: false,
};

export const migrateCartAsync = createAsyncThunk(
  "cart/migrateCartAsync",
  async (items: CartItem[]) => {
    const session = await getSession();
    const isAuth = !!session?.accessToken;

    if (!isAuth || items.length === 0) return null;

    try {
      // ✅ Push each local item to the server
      for (const item of items) {
        await cartService.addItem({
          productId: item.id,
          size: item.size,
          quantity: item.quantity,
        });
      }

      // ✅ Fetch the final merged cart from server
      const updatedCart = await cartService.getCart();
      return mapCartApiResponseToRedux(updatedCart);
    } catch (error) {
      console.error("Cart migration failed:", error);
      throw error;
    }
  },
);

export const addToCartAsync = createAsyncThunk(
  "cart/addToCartAsync",
  async (payload: {
    id: string;
    size: string;
    quantity: number;
    name: string;
    image: string;
    price: string | number;
    color?: string;
  }) => {
    const normalizedSize = payload.size?.trim();
    if (!normalizedSize) {
      throw new Error("Size selection is required before adding to cart.");
    }

    const session = await getSession();
    const isAuth = !!session?.accessToken;

    if (isAuth) {
      const response = await cartService.addItem({
        productId: payload.id,
        size: normalizedSize,
        quantity: payload.quantity,
      });
      // Return the backend's idea of the cart items
      return {
        items: mapCartApiResponseToRedux(response),
        isAuth: true,
      };
    }

    return {
      item: {
        ...payload,
        size: normalizedSize,
      },
      isAuth: false,
    };
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /* 🔥 Switch to backend mode */
    setAuthMode(state, action: PayloadAction<boolean>) {
      state.isAuthenticatedMode = action.payload;
    },

    /* 🔥 Replace cart from backend */
    setCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;

      if (!state.isAuthenticatedMode) {
        saveCartToStorage(state.items);
      }
    },

    addToCart(state, action: PayloadAction<CartItem>) {
      const normalizedSize = action.payload.size?.trim();
      if (!normalizedSize) {
        return;
      }

      const existing = state.items.find(
        (item) => item.id === action.payload.id && item.size === normalizedSize,
      );

      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push({
          ...action.payload,
          size: normalizedSize,
        });
      }

      if (!state.isAuthenticatedMode) {
        saveCartToStorage(state.items);
      }
    },

    updateQuantity(
      state,
      action: PayloadAction<{
        id: string;
        size: string;
        quantity: number;
      }>,
    ) {
      const item = state.items.find(
        (i) => i.id === action.payload.id && i.size === action.payload.size,
      );

      if (item && action.payload.quantity > 0) {
        item.quantity = action.payload.quantity;

        if (!state.isAuthenticatedMode) {
          saveCartToStorage(state.items);
        }
      }
    },

    removeFromCart(state, action: PayloadAction<{ id: string; size: string }>) {
      state.items = state.items.filter(
        (item) =>
          !(item.id === action.payload.id && item.size === action.payload.size),
      );

      if (!state.isAuthenticatedMode) {
        saveCartToStorage(state.items);
      }
    },

    clearCart(state) {
      state.items = [];

      if (!state.isAuthenticatedMode) {
        saveCartToStorage([]);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addToCartAsync.fulfilled, (state, action) => {
      const { items, item, isAuth } = action.payload as any;

      if (isAuth && items) {
        // 🔥 Backend is source of truth
        state.items = items;
      } else if (item) {
        // Guest mode - local logic
        const existing = state.items.find(
          (i) => i.id === item.id && i.size === item.size,
        );

        if (existing) {
          existing.quantity += item.quantity;
        } else {
          state.items.push(item);
        }
      }

      if (!state.isAuthenticatedMode) {
        saveCartToStorage(state.items);
      }
    });
    builder.addCase(migrateCartAsync.fulfilled, (state, action) => {
      if (action.payload) {
        state.items = action.payload;
        state.isAuthenticatedMode = true;
      }
    });
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setCart,
  setAuthMode,
} = cartSlice.actions;

export default cartSlice.reducer;
