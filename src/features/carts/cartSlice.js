
import { createSlice } from "@reduxjs/toolkit";

const loadCartFromStorage = () => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return [];
    const raw = localStorage.getItem("hoh_cart_items");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items) => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("hoh_cart_items", JSON.stringify(items));
    }
  } catch (e) {
    console.warn("Failed to persist cart:", e);
  }
};

const initialState = {
  items: loadCartFromStorage(),
  loading: false,
  error: null,
};

const getCartItemId = (item) =>
  `${item.productId || item._id}::${item.variantId || "default"}${item.isSample ? "::sample" : ""}`;

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    setCartItems: (state, action) => {
      state.items = (action.payload || []).map((item) => ({
        ...item,
        productId: item.productId || item._id,
        cartItemId: item.cartItemId || getCartItemId(item),
        quantity: Math.max(1, Number(item.quantity) || 1),
      }));
      state.error = null;
      saveCartToStorage(state.items);
    },

    addToCart: (state, action) => {
      const newItem = action.payload;

      const productId = newItem.productId || newItem._id;
      const cartItemId = getCartItemId({
        ...newItem,
        productId,
      });

      const existingItem = state.items.find(
        (item) =>
          (item.cartItemId || getCartItemId(item)) === cartItemId
      );

      if (existingItem) {
        existingItem.quantity =
          (Number(existingItem.quantity) || 1) +
          (Number(newItem.quantity) || 1);
      } else {
        state.items.push({
          ...newItem,
          productId,
          cartItemId,
          quantity: Math.max(1, Number(newItem.quantity) || 1),
        });
      }

      state.error = null;
      saveCartToStorage(state.items);
    },

    removeFromCart: (state, action) => {
      const id = String(action.payload);

      state.items = state.items.filter(
        (item) =>
          String(item.cartItemId || getCartItemId(item)) !== id &&
          String(item._id) !== id
      );
      saveCartToStorage(state.items);
    },

    updateCartQuantity: (state, action) => {
      const { id, cartItemId, quantity } = action.payload;
      const targetId = String(cartItemId || id);

      const item = state.items.find(
        (entry) =>
          String(entry.cartItemId || getCartItemId(entry)) === targetId
      );

      const nextQuantity = Math.floor(Number(quantity));

      if (item && Number.isFinite(nextQuantity) && nextQuantity >= 1) {
        item.quantity = nextQuantity;
      }
      saveCartToStorage(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      saveCartToStorage(state.items);
    },

    setCartLoading: (state, action) => {
      state.loading = action.payload;
    },

    setCartError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCartItems,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  setCartLoading,
  setCartError,
} = cartSlice.actions;

export default cartSlice.reducer;
