import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Eye,
  EyeOff,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lock,
  Building2,
  CheckCircle2,
} from "lucide-react";
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

export default function TradeLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const urlFrom = searchParams.get("from");

  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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
        "Missing Credentials",
        "Please enter your registered professional trade email and password."
      );
      return;
    }

    try {
      setLoading(true);
      dispatch(setAuthLoading(true));
      dispatch(setAuthError(null));

      const response = await axiosInstance.post("/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const result = response.data;
      const data = result?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Trade login failed.");
      }

      const user = data?.user;
      const token = data?.accessToken;
      const refreshToken = data?.refreshToken;

      if (!user || !token || !refreshToken) {
        throw new Error(
          "The login response is missing credentials or session tokens."
        );
      }

      sessionStorage.setItem("refreshToken", refreshToken);

      dispatch(
        setCredentials({
          user,
          token,
          refreshToken,
        })
      );

      // Determine trade role or account type
      const userRoles = Array.isArray(user?.roles) ? user.roles : [];
      const roleSlugs = userRoles.map((r) =>
        typeof r === "string" ? r.toLowerCase() : r?.slug?.toLowerCase() || ""
      );

      const isTradeUser =
        user?.isTradeAccount ||
        user?.accountType === "BUSINESS" ||
        roleSlugs.includes("trade") ||
        roleSlugs.includes("trade-user") ||
        roleSlugs.includes("trade_user") ||
        Boolean(user?.tradeProfile);

      const isAdminUser =
        roleSlugs.includes("admin") ||
        roleSlugs.includes("super-admin") ||
        roleSlugs.includes("super_admin") ||
        roleSlugs.includes("manager");

      const requestedPath = urlFrom || location.state?.from?.pathname;

      let destination = "/admin";
      if (requestedPath && requestedPath.startsWith("/") && !requestedPath.startsWith("//")) {
        destination = requestedPath;
      } else if (isAdminUser) {
        destination = "/admin";
      } else if (isTradeUser) {
        destination = "/admin";
      }

      showToast(
        isTradeUser
          ? "Welcome to House of Hackney Trade Concierge Atelier"
          : "Signed in successfully. You can manage trade privileges in Trade Concierge."
      );

      navigate(destination, { replace: true });
    } catch (err) {
      console.error("Trade login error:", err);
      let message =
        err.response?.data?.message ||
        err.message ||
        "Unable to sign in. Please verify your trade email and password.";

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
      await showError("Authentication Failed", message);
    } finally {
      setLoading(false);
      dispatch(setAuthLoading(false));
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#d8d5ce] bg-white px-4 py-3.5 text-sm text-[#171713] placeholder-[#88857d] outline-none transition focus:border-[#394132] focus:ring-1 focus:ring-[#394132]";

  return (
    <main className="min-h-screen bg-[#f6f3ec] text-[#171713] px-4 py-12 md:py-20 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-4xl">
        {/* Navigation Breadcrumb / Tag */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs tracking-wider uppercase">
          <Link
            to="/trade"
            className="text-[#4a5240] hover:text-[#171713] transition font-medium flex items-center gap-1.5"
          >
            ← House of Hackney Trade
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[#77746c]">Need a trade account?</span>
            <Link
              to="/trade/register"
              className="font-semibold text-[#394132] underline hover:text-black transition"
            >
              Apply For Membership
            </Link>
          </div>
        </div>

        {/* Card Container */}
        <div className="grid grid-cols-1 md:grid-cols-12 rounded-3xl border border-[#ede9e1] bg-white shadow-sm overflow-hidden">
          {/* Left Side: Brand Visual & Programme Highlights */}
          <div className="md:col-span-5 bg-[#394132] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Background decorative pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ded9c7_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[2px] text-[#ded9c7] border border-white/15">
                <Sparkles size={12} className="text-[#c29b38]" />
                Professional B2B Portal
              </div>

              <h2 className="mt-5 font-serif text-3xl sm:text-4xl text-[#f6f3ec] leading-tight">
                House of Hackney Trade Concierge
              </h2>

              <p className="mt-3 text-xs sm:text-sm text-[#d2cec3] leading-relaxed">
                Sign in to manage studio commissions, view wholesale pricing tiers, order
                complimentary large swatches, and submit bespoke repeat requests.
              </p>

              <div className="mt-8 space-y-4 border-t border-white/15 pt-6 text-xs text-[#d2cec3]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-[#c29b38] shrink-0" />
                  <span>Wholesale pricing automatically applied at checkout</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-[#c29b38] shrink-0" />
                  <span>Expedited A4 wallpaper and velvet swatch dispatch</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-[#c29b38] shrink-0" />
                  <span>Direct atelier line for custom scale alterations</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-10 pt-6 border-t border-white/15">
              <span className="text-[10px] uppercase tracking-wider text-[#ded9c7]/70 block mb-1">
                Security Assurance
              </span>
              <p className="text-[11px] text-[#d2cec3]/80 leading-snug">
                Encrypted enterprise session management protected by JWT & biometric tokens.
              </p>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="md:col-span-7 p-7 sm:p-10 flex flex-col justify-center">
            <div className="mb-8">
              <span className="text-[11px] uppercase tracking-[2.5px] font-semibold text-[#4a5240]">
                Partner Sign In
              </span>
              <h1 className="mt-1 font-serif text-3xl text-[#171713]">
                Access Trade Account
              </h1>
              <p className="mt-1.5 text-xs text-[#77746c]">
                Please enter your registered studio or business email address.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c] mb-1.5">
                  Professional Email Address *
                </label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="designer@studio.com"
                  className={inputClass}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c]">
                    Account Password *
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#77746c] hover:text-[#171713] transition"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your trade password"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77746c] hover:text-[#171713] cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#55534c]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#d8d5ce] text-[#394132] focus:ring-[#394132]"
                  />
                  <span>Remember this device</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#394132] py-4 text-xs font-semibold uppercase tracking-[2px] text-white shadow-md hover:bg-[#282e23] disabled:opacity-50 transition cursor-pointer"
              >
                <span>{loading ? "Authenticating Partner..." : "Sign In to Trade Concierge"}</span>
                <ArrowRight size={16} />
              </button>

              <div className="border-t border-[#ede9e1] pt-6 space-y-3">
                <div className="text-center text-xs text-[#77746c]">
                  Don't have a Trade Account yet?{" "}
                  <Link
                    to="/trade/register"
                    className="font-semibold text-[#394132] uppercase tracking-wider hover:underline"
                  >
                    Apply For Membership →
                  </Link>
                </div>

                <div className="rounded-xl bg-[#faf8f4] p-3 text-center text-xs text-[#66645e] border border-[#ede9e1]">
                  <span>Looking for standard retail shopping? </span>
                  <Link to="/login" className="font-semibold text-[#171713] underline hover:text-[#394132]">
                    Retail Patron Sign In
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
