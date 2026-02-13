// store/slices/ui.slice.ts
import { createSlice } from "@reduxjs/toolkit";

interface UiState {
  isCartOpen: boolean;
}

const initialState: UiState = {
  isCartOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openCart: (state) => {
      state.isCartOpen = true;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
  },
});

export const { openCart, closeCart } = uiSlice.actions;
export default uiSlice.reducer;
