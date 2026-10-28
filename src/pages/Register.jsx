
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

import {
  showError,
  showWarning,
  showToast,
} from "../utils/sweetAlert";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  countryCode: "+91",
  password: "",
};

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("type") === "trade") {
      navigate("/trade/register", { replace: true });
    }
  }, [location.search, navigate]);

  const [formData, setFormData] = useState(initialForm);
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

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password
    ) {
      await showWarning(
        "Missing information",
        "Please complete all required fields."
      );
      return;
    }

    if (formData.password.length < 8) {
      await showWarning(
        "Password too short",
        "Your password must contain at least 8 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = formData.email.trim().toLowerCase();

      const response = await axiosInstance.post("/auth/register", {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: normalizedEmail,
        phone: formData.phone.trim(),
      });

      const result = response.data;

      if (!result?.success) {
        throw new Error(result?.message || "Registration failed.");
      }

      sessionStorage.setItem(
        "pendingVerificationEmail",
        normalizedEmail
      );

      try {
        localStorage.removeItem("hoh_wishlist_items");
        window.dispatchEvent(new Event("hoh-wishlist-change"));
      } catch {}

      // Briefly show success before navigating to email verification.
      showToast("Account created successfully");

      navigate("/verify-email", {
        state: {
          email: normalizedEmail,
        },
        replace: true,
      });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to register. Please try again.";

      await showError("Registration unsuccessful", message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-[#d8d5ce] bg-transparent px-4 py-3.5 text-sm outline-none transition focus:border-[#394132]";

  return (
    <main className="min-h-screen bg-[#f6f3ec] px-5 py-12 text-[#171713] md:py-20">
      <div className="mx-auto max-w-lg">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs tracking-[3px]">
            HOUSE OF HACKNEY
          </p>

          <h1 className="font-serif text-4xl md:text-5xl">
            Create an account
          </h1>

          <p className="mt-4 text-sm text-[#68675f]">
            Join us to make your house your own.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-xs tracking-wide"
              >
                FIRST NAME
              </label>

              <input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                autoComplete="given-name"
                className={inputClass}
                placeholder="First name"
                required
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-xs tracking-wide"
              >
                LAST NAME
              </label>

              <input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                autoComplete="family-name"
                className={inputClass}
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs tracking-wide"
            >
              EMAIL ADDRESS
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              className={inputClass}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-xs tracking-wide"
            >
              PHONE NUMBER
            </label>

            <div className="flex">
              <select
                name="countryCode"
                aria-label="Country calling code"
                value={formData.countryCode}
                onChange={handleChange}
                className="w-28 border border-r-0 border-[#d8d5ce] bg-transparent px-2 text-sm outline-none"
              >
                <option value="+91">+91 (IN)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+1">+1 (US/CA)</option>
                <option value="+971">+971 (UAE)</option>
                <option value="+61">+61 (AU)</option>
              </select>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel-national"
                className={`${inputClass} min-w-0`}
                placeholder="Phone number"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-xs tracking-wide"
            >
              PASSWORD
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                className={`${inputClass} pr-12`}
                placeholder="At least 8 characters"
                minLength={8}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                className="absolute inset-y-0 right-0 grid w-12 place-items-center text-[#68675f]"
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-[#394132] px-5 py-4 text-xs tracking-[2px] text-white transition hover:bg-[#252c20] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <LoaderCircle size={17} className="animate-spin" />
            )}
            {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
          </button>

          <p className="text-center text-xs leading-5 text-[#68675f]">
            By creating an account, you agree to our applicable terms and
            privacy policy.
          </p>
        </form>

        <div className="mt-8 border-t border-[#dedbd4] pt-6 text-center">
          <p className="text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="underline underline-offset-4 hover:text-[#394132]"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Trade Partner Portal banner */}
        <div className="mt-8 rounded-2xl border border-[#ede9e1] bg-white p-5 text-center shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-[2px] text-[#4a5240]">
            Interior Designers & Design Studios
          </span>
          <p className="mt-1 text-xs text-[#68675f]">
            Are you an interior designer, architect, or hospitality partner? Apply for exclusive trade privileges.
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <Link
              to="/trade/register"
              className="rounded-xl bg-[#394132] px-4 py-2 text-xs font-medium uppercase tracking-[1px] text-white hover:bg-[#252c20] transition"
            >
              Apply For Trade Account →
            </Link>
            <Link
              to="/trade/login"
              className="rounded-xl border border-[#394132] px-4 py-2 text-xs font-medium uppercase tracking-[1px] text-[#394132] hover:bg-[#394132] hover:text-white transition"
            >
              Trade Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;
