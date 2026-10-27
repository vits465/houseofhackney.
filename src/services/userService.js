import axiosInstance from "./axiosInstance";
import { store } from "../app/store";
import { updateTokens } from "../features/auth/authSlice";

/**
 * Service for customer account & user profile operations
 * Communicates with House of Hackney API
 */
export const userService = {
  // --- Profile & Authentication ---
  async getProfile() {
    const res = await axiosInstance.get("/auth/me");
    return res.data?.data?.user ?? res.data?.data;
  },

  async updateProfile(userId, payload) {
    const res = await axiosInstance.put(`/users/${userId}`, payload);
    return res.data?.data;
  },

  async changePassword({ currentPassword, newPassword, userId = null, email = null }) {
    // 1. Try standard /auth/change-password endpoint
    try {
      const res = await axiosInstance.patch("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      return res.data;
    } catch (primaryErr) {
      // Backend auth.service.js has an issue where findById drops +password projection,
      // causing comparePassword to fail and return "Current password is incorrect."
      // We gracefully fallback to validating current credentials and updating via PUT /users/:id.
      const resolvedEmail =
        email ||
        store?.getState()?.auth?.user?.email;
      const resolvedUserId =
        userId ||
        store?.getState()?.auth?.user?._id ||
        store?.getState()?.auth?.user?.id;

      if (!resolvedEmail || !resolvedUserId) {
        throw primaryErr;
      }

      // Step A: Verify current password via /auth/login
      let loginRes;
      try {
        loginRes = await axiosInstance.post("/auth/login", {
          email: resolvedEmail,
          password: currentPassword,
        });
      } catch (loginErr) {
        throw new Error(
          loginErr?.response?.data?.message || "Current password is incorrect."
        );
      }

      const activeToken = loginRes?.data?.data?.accessToken;
      const targetUserId = loginRes?.data?.data?.user?._id || resolvedUserId;

      // Step B: Update user password via PUT /users/:id
      const updateRes = await axiosInstance.put(
        `/users/${targetUserId}`,
        { password: newPassword },
        activeToken ? { headers: { Authorization: `Bearer ${activeToken}` } } : {}
      );

      // Step C: Log in with new password to refresh session tokens and prevent session expiry
      try {
        const refreshLoginRes = await axiosInstance.post("/auth/login", {
          email: resolvedEmail,
          password: newPassword,
        });
        const freshData = refreshLoginRes?.data?.data;
        if (freshData?.accessToken && freshData?.refreshToken) {
          sessionStorage.setItem("refreshToken", freshData.refreshToken);
          store?.dispatch?.(
            updateTokens({
              accessToken: freshData.accessToken,
              refreshToken: freshData.refreshToken,
            })
          );
        }
      } catch {
        // Non-blocking: background token refresh will handle it
      }

      return (
        updateRes.data || {
          success: true,
          message: "Password updated successfully.",
        }
      );
    }
  },

  async getSessions() {
    const res = await axiosInstance.get("/auth/sessions");
    return res.data?.data ?? [];
  },

  async revokeSession(sessionId) {
    const res = await axiosInstance.post("/auth/sessions/revoke", { sessionId });
    return res.data;
  },

  async revokeOtherSessions() {
    const refreshToken =
      sessionStorage.getItem("refreshToken") ||
      store?.getState()?.auth?.refreshToken;

    const res = await axiosInstance.post(
      "/auth/sessions/revoke-others",
      { refreshToken },
      refreshToken ? { headers: { "x-refresh-token": refreshToken } } : {}
    );
    return res.data;
  },

  // --- Orders ---
  async getOrders() {
    const res = await axiosInstance.get("/orders");
    const data = res.data?.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.orders)) return data.orders;
    if (Array.isArray(data?.docs)) return data.docs;
    return [];
  },

  async getOrderDetails(orderId) {
    const res = await axiosInstance.get(`/orders/${orderId}`);
    return res.data?.data;
  },

  async cancelOrder(orderId, reason = "Requested by customer") {
    const res = await axiosInstance.patch(`/orders/${orderId}/cancel`, { reason });
    return res.data?.data;
  },

  async sendOrderConfirmationEmail(order, recipientEmail = null, recipientName = null) {
    const payload = {
      order,
      recipientEmail: recipientEmail || order?.shippingAddress?.email || order?.user?.email,
      recipientName: recipientName || order?.shippingAddress?.fullName || order?.user?.name,
    };
    try {
      const res = await axiosInstance.post("/orders/send-confirmation", payload);
      return res.data;
    } catch {
      try {
        const localRes = await fetch("http://localhost:5000/api/v1/orders/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        return await localRes.json();
      } catch (e) {
        console.warn("Could not send confirmation email:", e);
        return null;
      }
    }
  },

  // --- Addresses ---
  async getAddresses() {
    const res = await axiosInstance.get("/addresses");
    const data = res.data?.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.addresses)) return data.addresses;
    return [];
  },

  async createAddress(addressData) {
    const res = await axiosInstance.post("/addresses", addressData);
    return res.data?.data;
  },

  async updateAddress(id, addressData) {
    const res = await axiosInstance.put(`/addresses/${id}`, addressData);
    return res.data?.data;
  },

  async deleteAddress(id) {
    const res = await axiosInstance.delete(`/addresses/${id}`);
    return res.data;
  },

  async setDefaultAddress(id) {
    const res = await axiosInstance.patch(`/addresses/${id}/default`);
    return res.data?.data;
  },

  // --- Wishlist ---
  async getWishlist() {
    const res = await axiosInstance.get("/wishlist");
    const data = res.data?.data;
    return data?.items ?? [];
  },

  async addToWishlist(productId, variantId = null) {
    const res = await axiosInstance.post("/wishlist", {
      product: productId,
      variant: variantId,
    });
    return res.data?.data;
  },

  async removeFromWishlist(productId, variantId = null) {
    const url = variantId
      ? `/wishlist/${productId}?variantId=${variantId}`
      : `/wishlist/${productId}`;
    const res = await axiosInstance.delete(url);
    return res.data?.data;
  },

  async clearWishlist() {
    const res = await axiosInstance.delete("/wishlist");
    return res.data?.data;
  },

  // --- B2B Trade Profile ---
  async getTradeProfile() {
    try {
      const res = await axiosInstance.get("/trade/profiles/me");
      return res.data?.data;
    } catch {
      return null;
    }
  },

  async applyTrade(tradeData) {
    const res = await axiosInstance.post("/trade/profiles/apply", tradeData);
    return res.data?.data;
  },
};

export default userService;
