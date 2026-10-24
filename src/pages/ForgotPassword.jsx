
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, LoaderCircle } from "lucide-react";
import axiosInstance from "../services/axiosInstance";

import {
  showError,
  showWarning,
  showToast,
} from "../utils/sweetAlert";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      await showWarning(
        "Email required",
        "Please enter your email address."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post(
        "/auth/forgot-password",
        { email: normalizedEmail }
      );

      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message || "Unable to request a password reset."
        );
      }

      sessionStorage.setItem(
        "pendingPasswordResetEmail",
        normalizedEmail
      );

      showToast("Password-reset request submitted");

      navigate("/verify-reset-otp", {
        replace: true,
        state: { email: normalizedEmail },
      });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to request a password reset. Please try again.";

      await showError("Unable to reset password", message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-[#d8d5ce] bg-transparent px-4 py-3.5 text-sm outline-none transition focus:border-[#394132]";

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-[#f6f3ec] px-5 py-16 text-[#171713]">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full border border-[#d8d5ce]">
            <Mail size={25} strokeWidth={1.4} />
          </div>

          <p className="mb-3 text-xs tracking-[3px]">
            HOUSE OF HACKNEY
          </p>

          <h1 className="font-serif text-4xl">
            Forgot password?
          </h1>

          <p className="mt-4 text-sm leading-6 text-[#68675f]">
            Enter the email address associated with your account.
            We'll send you a password-reset verification code if
            the account is eligible.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs tracking-wide"
            >
              EMAIL ADDRESS
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-[#394132] px-5 py-4 text-xs tracking-[2px] text-white transition hover:bg-[#252c20] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <LoaderCircle size={17} className="animate-spin" />
            )}

            {loading ? "SENDING REQUEST..." : "RESET PASSWORD"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-[#68675f]">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-[#171713] underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
};

export default ForgotPassword;
