
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, LoaderCircle } from "lucide-react";
import axiosInstance from "../services/axiosInstance";

import {
  showError,
  showWarning,
  showToast,
} from "../utils/sweetAlert";

const RESEND_COOLDOWN = 60;

const VerifyResetOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    location.state?.email ||
      sessionStorage.getItem("pendingPasswordResetEmail") ||
      ""
  );

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleVerify = async (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = otp.trim();

    if (!normalizedEmail || !/^\d{4,8}$/.test(normalizedOtp)) {
      await showWarning(
        "Check your details",
        "Enter a valid email address and verification code."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post(
        "/auth/verify-reset-otp",
        {
          email: normalizedEmail,
          otp: normalizedOtp,
        }
      );

      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message || "OTP verification failed."
        );
      }

      const resetToken = result?.data?.resetToken;

      if (!resetToken) {
        throw new Error(
          "The server did not return a reset authorization token."
        );
      }

      // Pass the short-lived reset token to the next page.
      navigate("/reset-password", {
        replace: true,
        state: {
          email: normalizedEmail,
          resetToken,
        },
      });

      showToast("Verification successful");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to verify the reset code.";

      await showError("Verification unsuccessful", message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (secondsLeft > 0 || resending || loading) return;

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      await showWarning(
        "Email required",
        "Enter your email address before requesting a new code."
      );
      return;
    }

    setResending(true);

    try {
      const response = await axiosInstance.post("/auth/resend-otp", {
        email: normalizedEmail,
        purpose: "PASSWORD_RESET",
      });

      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message || "Unable to resend the reset code."
        );
      }

      setOtp("");
      setSecondsLeft(RESEND_COOLDOWN);

      showToast("A new password-reset code has been sent");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to resend the reset code.";

      await showError("Unable to resend code", message);
    } finally {
      setResending(false);
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
            Verify reset code
          </h1>

          <p className="mt-4 text-sm leading-6 text-[#68675f]">
            Enter the password-reset verification code sent to
            your email address.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5">
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

          <div>
            <label
              htmlFor="otp"
              className="mb-2 block text-xs tracking-wide"
            >
              RESET VERIFICATION CODE
            </label>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))
              }
              className={`${inputClass} text-center text-xl tracking-[8px]`}
              placeholder="Enter OTP"
              maxLength={8}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || resending}
            className="flex w-full items-center justify-center gap-2 bg-[#394132] px-5 py-4 text-xs tracking-[2px] text-white transition hover:bg-[#252c20] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <LoaderCircle size={17} className="animate-spin" />
            )}

            {loading ? "VERIFYING..." : "VERIFY RESET CODE"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending || loading || secondsLeft > 0}
            className="inline-flex items-center justify-center gap-2 text-sm underline underline-offset-4 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resending ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Sending code...
              </>
            ) : secondsLeft > 0 ? (
              `Resend code in ${secondsLeft}s`
            ) : (
              "Resend reset code"
            )}
          </button>

          {secondsLeft > 0 && (
            <p className="mt-2 text-xs text-[#68675f]">
              You can request another code in {secondsLeft} seconds.
            </p>
          )}
        </div>

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

export default VerifyResetOtp;
