import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

import axiosInstance from "../services/axiosInstance";
import {
  setCredentials,
  setAuthLoading,
  setAuthError,
} from "../features/auth/authSlice";

import {
  showError,
  showWarning,
  showToast,
} from "../utils/sweetAlert";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const isSessionExpired = searchParams.get("expired") === "true";
  const urlFrom = searchParams.get("from");

  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      await showWarning(
        "Missing information",
        "Please enter your email address and password."
      );
      return;
    }

    try {
      setLoading(true);
      dispatch(setAuthLoading(true));
      dispatch(setAuthError(null));

      const response = await axiosInstance.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      const result = response.data;
      const data = result?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Login failed.");
      }

      const user = data?.user;
      const token = data?.accessToken;
      const refreshToken = data?.refreshToken;

      if (!user || !token || !refreshToken) {
        throw new Error(
          "The login response is missing user or authentication tokens."
        );
      }

      // Keep the refresh token in session storage.
      // Keep the access token in Redux memory.
      sessionStorage.setItem("refreshToken", refreshToken);
      sessionStorage.removeItem("hoh_preview_role");

      dispatch(
        setCredentials({
          user,
          token,
          refreshToken,
        })
      );

      const requestedPath = urlFrom || location.state?.from?.pathname;

      // Determine role destination
      const userRoles = Array.isArray(user?.roles) ? user.roles : [];
      const roleSlugs = userRoles.map((r) =>
        typeof r === "string" ? r.toLowerCase() : r?.slug?.toLowerCase() || ""
      );
      const isTradeUser =
        roleSlugs.includes("trade") ||
        roleSlugs.includes("trade-user") ||
        roleSlugs.includes("trade_user") ||
        Boolean(user?.isTradeAccount) ||
        user?.accountType === "TRADE" ||
        user?.accountType === "BUSINESS" ||
        Boolean(user?.tradeProfile);
      const isAdminUser =
        roleSlugs.includes("admin") ||
        roleSlugs.includes("super-admin") ||
        roleSlugs.includes("super_admin") ||
        roleSlugs.includes("manager");

      let destination = "/";
      if (requestedPath?.startsWith("/") && !requestedPath.startsWith("//")) {
        destination = requestedPath;
      } else if (isTradeUser || isAdminUser) {
        destination = "/admin";
      }

      // Show a small, elegant success notification.
      showToast(
        isTradeUser
          ? "Welcome to House of Hackney Trade B2B Atelier"
          : "Welcome back to House of Hackney"
      );

      navigate(destination, { replace: true });
    } catch (err) {
      console.error("Login error:", err);

      let message =
        err.response?.data?.message ||
        err.message ||
        "Unable to sign in. Please try again.";

      if (Array.isArray(err.response?.data?.errors) && err.response.data.errors.length > 0) {
        const fieldDetails = err.response.data.errors
          .map((e) => e.msg || e.message)
          .filter(Boolean)
          .join(". ");
        if (fieldDetails) {
          message = fieldDetails;
        }
      }

      if (message.toLowerCase().includes("network error") || err.code === "ERR_NETWORK") {
        message = "Unable to connect to the House of Hackney atelier server. Please verify your connection or ensure the API server is active.";
      }

      dispatch(setAuthError(message));

      await showError("Unable to sign in", message);
    } finally {
      setLoading(false);
      dispatch(setAuthLoading(false));
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f3ec] px-5 py-12 text-[#171713] sm:py-20">
      <div className="mx-auto w-full max-w-md">
        <Link
          to="/"
          className="mb-12 block text-center text-2xl font-semibold uppercase tracking-[0.2em] sm:text-3xl"
        >
          HOUSE OF HACKNEY
        </Link>

        {isSessionExpired && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm animate-in fade-in">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Atelier Session Expired</p>
              <p className="text-amber-800 mt-0.5">
                Your authentication token has expired. Please sign in again with your credentials to resume your atelier session.
              </p>
            </div>
          </div>
        )}

        <div className="mb-9 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#68675f]">
            Welcome back
          </p>

          <h1 className="font-serif text-3xl sm:text-4xl">
            Sign in to your account
          </h1>

          <p className="mt-4 text-sm leading-6 text-[#68675f]">
            Sign in to access your account and discover more from our House.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.12em]"
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className="w-full border border-[#d8d5ce] bg-transparent px-4 py-3.5 text-sm outline-none transition focus:border-[#394132]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.12em]"
            >
              Password
            </label>

            <div className="flex border border-[#d8d5ce] focus-within:border-[#394132]">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="px-4 text-[#68675f] hover:text-[#171713]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm underline underline-offset-4 hover:text-[#68675f]"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 bg-[#394132] px-5 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-[#252c20] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="my-9 border-t border-[#d8d5ce]" />

        <div className="text-center">
          <h2 className="font-serif text-2xl">New to our House?</h2>

          <p className="mt-3 text-sm leading-6 text-[#68675f]">
            Create an account to get started.
          </p>

          <Link
            to="/register"
            className="mt-5 inline-flex w-full items-center justify-center border border-[#394132] px-5 py-4 text-xs font-medium uppercase tracking-[0.2em] transition hover:bg-[#394132] hover:text-white"
          >
            Create an account
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-[#ede9e1] bg-white p-5 text-center shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-[2px] text-[#4a5240]">
            Interior Designers & Architects
          </span>
          <p className="mt-1 text-xs text-[#68675f]">
            Access your B2B trade account with commercial pricing and complimentary samples.
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <Link
              to="/trade/login"
              className="rounded-xl bg-[#394132] px-4 py-2 text-xs font-medium uppercase tracking-[1px] text-white hover:bg-[#252c20] transition"
            >
              Trade Login →
            </Link>
            <Link
              to="/trade/register"
              className="rounded-xl border border-[#394132] px-4 py-2 text-xs font-medium uppercase tracking-[1px] text-[#394132] hover:bg-[#394132] hover:text-white transition"
            >
              Apply for Trade
            </Link>
          </div>
        </div>

        <p className="mt-10 text-center text-xs leading-5 text-[#68675f]">
          By continuing, you agree to our applicable terms and privacy policy.
        </p>
      </div>
    </main>
  );
};

export default Login;
