import axiosInstance from "./axiosInstance";

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

  async changePassword({ currentPassword, newPassword }) {
    const res = await axiosInstance.patch("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return res.data;
  },

  async getSessions() {
    const res = await axiosInstance.get("/auth/sessions");
    return res.data?.data ?? [];
  },

  async revokeOtherSessions() {
    const res = await axiosInstance.post("/auth/sessions/revoke-others");
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
