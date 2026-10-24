
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  LoaderCircle,
} from "lucide-react";

import axiosInstance from "../services/axiosInstance";
import {
  showError,
  showWarning,
  showToast,
} from "../utils/sweetAlert";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";
  const resetToken = location.state?.resetToken || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !resetToken) {
      await showWarning(
        "Reset session expired",
        "Please verify your password-reset code again."
      );
      return;
    }

    if (newPassword.length < 8) {
      await showWarning(
        "Password too short",
        "Your password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      await showWarning(
        "Passwords don't match",
        "Please make sure both password fields match."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post(
        "/auth/reset-password",
        {
          email,
          resetToken,
          newPassword,
        }
      );

      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message || "Unable to reset your password."
        );
      }

      sessionStorage.removeItem("pendingPasswordResetEmail");

      showToast("Password reset successfully");

      navigate("/login", {
        replace: true,
        state: {
          email,
          passwordReset: true,
        },
      });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to reset your password. Please try again.";

      await showError("Password reset failed", message);
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
            <LockKeyhole size={25} strokeWidth={1.4} />
          </div>

          <p className="mb-3 text-xs tracking-[3px]">
            HOUSE OF HACKNEY
          </p>

          <h1 className="font-serif text-4xl">
            Create new password
          </h1>

          <p className="mt-4 text-sm leading-6 text-[#68675f]">
            Choose a strong password with at least 8 characters.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="newPassword"
              className="mb-2 block text-xs tracking-wide"
            >
              NEW PASSWORD
            </label>

            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`${inputClass} pr-12`}
                placeholder="Enter new password"
                minLength={8}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#68675f]"
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-xs tracking-wide"
            >
              CONFIRM NEW PASSWORD
            </label>

            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              placeholder="Confirm new password"
              minLength={8}
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

            {loading ? "RESETTING PASSWORD..." : "RESET PASSWORD"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#68675f]">
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

export default ResetPassword;
