import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },

    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },

    setProductsLoading: (state, action) => {
      state.loading = action.payload;
    },

    setProductsError: (state, action) => {
      state.error = action.payload;
    },

    clearProductsError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setProducts,
  setSelectedProduct,
  setProductsLoading,
  setProductsError,
  clearProductsError,
} = productSlice.actions;

// Selectors
export const selectProducts = (state) => state.products?.products || [];
export const selectSelectedProduct = (state) => state.products?.selectedProduct || null;
export const selectProductLoading = (state) => Boolean(state.products?.loading);
export const selectProductError = (state) => state.products?.error || null;
export const selectProductPricing = (state) => state.products?.selectedProduct?.pricing || null;
export const selectProductInventory = (state) => state.products?.selectedProduct?.inventory || null;
export const selectProductSpecifications = (state) => state.products?.selectedProduct?.specifications || null;
export const selectProductIsInStock = (state) => {
  const inv = state.products?.selectedProduct?.inventory;
  return Boolean(
    inv &&
    inv.inStock !== false &&
    inv.status !== "OUT_OF_STOCK" &&
    (inv.availableQuantity === undefined || inv.availableQuantity > 0)
  );
};
export const selectProductSample = (state) => state.products?.selectedProduct?.pricing?.sample || null;

export default productSlice.reducer;