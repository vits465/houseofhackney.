
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user ?? null;
      state.token = action.payload.token ?? null;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.isAuthenticated = Boolean(state.token);
      state.error = null;
      state.initialized = true;
    },

    updateTokens: (state, action) => {
      state.token = action.payload.accessToken;
      state.refreshToken =
        action.payload.refreshToken ?? state.refreshToken;
      state.isAuthenticated = Boolean(state.token);
    },

    updateAccessToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = Boolean(state.token);
    },

    setAuthUser: (state, action) => {
      state.user = action.payload;
    },

    setAuthInitialized: (state, action) => {
      state.initialized = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.initialized = true;
    },

    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },

    setAuthError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCredentials,
  updateTokens,
  updateAccessToken,
  setAuthUser,
  setAuthInitialized,
  logout,
  setAuthLoading,
  setAuthError,
} = authSlice.actions;

export default authSlice.reducer;
