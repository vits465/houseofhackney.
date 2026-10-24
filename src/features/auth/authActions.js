
import axiosInstance from "../../services/axiosInstance";
import { store } from "../../app/store";
import { logout } from "./authSlice";

export const logoutUser = async () => {
  const refreshToken =
    store.getState().auth.refreshToken ||
    sessionStorage.getItem("refreshToken");

  try {
    if (refreshToken) {
      await axiosInstance.post("/auth/logout", {
        refreshToken,
      });
    }
  } catch (error) {
    console.error(
      "Server logout failed; clearing the local session.",
      error.response?.data?.message || error.message
    );
  } finally {
    sessionStorage.removeItem("refreshToken");
    store.dispatch(logout());
  }
};
