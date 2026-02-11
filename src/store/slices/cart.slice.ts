import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  loadCartFromStorage,
  saveCartToStorage,
} from "@/store/utils/cartStorage";

export type CartItem = {
  id: string;
  name: string;
  image: string;
  price: string | number;
  size: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: loadCartFromStorage(), // 🔥 LOAD ON INIT
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(
        item =>
          item.id === action.payload.id &&
          item.size === action.payload.size
      );

      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }

      saveCartToStorage(state.items); // 🔥 SAVE
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
        saveCartToStorage(state.items); // 🔥 SAVE
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

      saveCartToStorage(state.items); // 🔥 SAVE
    },

    clearCart(state) {
      state.items = [];
      saveCartToStorage([]); // 🔥 CLEAR STORAGE
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
