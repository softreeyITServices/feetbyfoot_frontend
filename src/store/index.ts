import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cart.slice";
import wishlistReducer from "./slices/wishlist.slice";
import uiReducer from "./slices/ui.slice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
