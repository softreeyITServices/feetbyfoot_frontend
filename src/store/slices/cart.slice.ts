import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  loadCartFromStorage,
  saveCartToStorage,
} from "@/store/utils/cartStorage";
import { cartService } from "@/domain/application/services/cart.service";
import { RootState } from "@/store";
import { getSession } from "next-auth/react";

export type CartItem = {
  id: string;        // productId
  itemId?: string;   // 🔥 backend _id
  name: string;
  image: string;
  price: string | number;
  size: string;
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

export const addToCartAsync = createAsyncThunk(
  "cart/addToCartAsync",
  async (
    payload: {
      id: string;
      size: string;
      quantity: number;
      name: string;
      image: string;
      price: string | number;
    }
  ) => {
    const normalizedSize = payload.size?.trim();
    if (!normalizedSize) {
      throw new Error("Size selection is required before adding to cart.");
    }

    const session = await getSession();
    const isAuth = !!session?.accessToken;

    if (isAuth) {
      await cartService.addItem({
        productId: payload.id,
        size: normalizedSize,
        quantity: payload.quantity,
      });
    }

    return {
      ...payload,
      size: normalizedSize,
    };
  }
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
        item =>
          item.id === action.payload.id &&
          item.size === normalizedSize
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
      }>
    ) {
      const item = state.items.find(
        i =>
          i.id === action.payload.id &&
          i.size === action.payload.size
      );

      if (item && action.payload.quantity > 0) {
        item.quantity = action.payload.quantity;

        if (!state.isAuthenticatedMode) {
          saveCartToStorage(state.items);
        }
      }
    },

    removeFromCart(
      state,
      action: PayloadAction<{ id: string; size: string }>
    ) {
      state.items = state.items.filter(
        item =>
          !(
            item.id === action.payload.id &&
            item.size === action.payload.size
          )
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
      const existing = state.items.find(
        item =>
          item.id === action.payload.id &&
          item.size === action.payload.size
      );

      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push({
          id: action.payload.id,
          name: action.payload.name,
          price: action.payload.price,
          image: action.payload.image,
          size: action.payload.size,
          quantity: action.payload.quantity,
        });
      }

      if (!state.isAuthenticatedMode) {
        saveCartToStorage(state.items);
      }
    });
  }

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
