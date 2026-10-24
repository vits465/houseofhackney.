import axiosInstance from "../../services/axiosInstance";

export const restoreSession = async () => {
  const refreshToken = sessionStorage.getItem("refreshToken");

  if (!refreshToken) {
    return null;
  }

  const response = await axiosInstance.post("/auth/refresh", {
    refreshToken,
  });

  const result = response.data;
  const data = result?.data;

  if (
    !result?.success ||
    !data?.accessToken ||
    !data?.refreshToken
  ) {
    throw new Error("Unable to restore session.");
  }

  sessionStorage.setItem("refreshToken", data.refreshToken);

  // Use the new access token to fetch the current user.
  const userResponse = await axiosInstance.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${data.accessToken}`,
    },
  });

  if (!userResponse.data?.success) {
    throw new Error("Unable to fetch user details.");
  }

  return {
    user: userResponse.data.data.user ?? userResponse.data.data,
    token: data.accessToken,
    refreshToken: data.refreshToken,
  };
};
