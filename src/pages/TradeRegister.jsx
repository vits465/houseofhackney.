import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Briefcase,
  ShieldCheck,
  Sparkles,
  Gift,
  Award,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import userService from "../services/userService";
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
  confirmPassword: "",
  companyName: "",
  businessType: "INTERIOR_DESIGNER",
  website: "",
  taxId: "",
  notes: "",
  agreeTerms: false,
};

export default function TradeRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.companyName.trim() ||
      !formData.password
    ) {
      await showWarning(
        "Missing Information",
        "Please complete all mandatory trade partner fields marked with an asterisk (*)."
      );
      return;
    }

    if (formData.password.length < 8) {
      await showWarning(
        "Password Security",
        "Your account password must contain at least 8 characters."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      await showWarning(
        "Password Mismatch",
        "The confirmation password does not match."
      );
      return;
    }

    if (!formData.agreeTerms) {
      await showWarning(
        "Terms Required",
        "Please accept the Trade Programme terms & commercial conditions to continue."
      );
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = formData.email.trim().toLowerCase();
      const sanitizedPhone = formData.phone.trim().replace(/[^\d+]/g, "");

      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: normalizedEmail,
        phone: sanitizedPhone,
        countryCode: formData.countryCode,
        password: formData.password,
        companyName: formData.companyName.trim(),
        companyPhone: sanitizedPhone,
        businessType:
          formData.businessType === "HOSPITALITY"
            ? "HOTEL_HOSPITALITY"
            : formData.businessType,
        website: formData.website.trim(),
        taxId: formData.taxId.trim(),
        notes: formData.notes.trim(),
        isTradeAccount: true,
        accountType: "BUSINESS",
      };

      const result = await userService.tradeRegister(payload);

      if (result && result.success === false) {
        throw new Error(result.message || "Trade registration failed.");
      }

      sessionStorage.setItem("pendingVerificationEmail", normalizedEmail);
      try {
        localStorage.removeItem("hoh_wishlist_items");
        window.dispatchEvent(new Event("hoh-wishlist-change"));
      } catch {}
      showToast("Trade partner account created. Verification OTP dispatched.");

      navigate("/verify-email", {
        state: {
          email: normalizedEmail,
          isTrade: true,
        },
        replace: true,
      });
    } catch (err) {
      let message =
        err.response?.data?.message ||
        err.message ||
        "Unable to complete trade registration. Please try again.";

      // Extract specific field errors from backend express-validator
      if (Array.isArray(err.response?.data?.errors) && err.response.data.errors.length > 0) {
        const fieldDetails = err.response.data.errors
          .map((e) => e.msg || e.message)
          .filter(Boolean)
          .join(". ");
        if (fieldDetails) {
          message = fieldDetails;
        }
      }

      // Provide friendly actionable suggestions for duplicate account conflicts
      if (message.toLowerCase().includes("phone already registered")) {
        message = "This phone number is already registered to an account. If you already have a House of Hackney account, please sign in and apply for Trade Concierge privileges from your Sanctuary Profile, or use a distinct direct studio phone.";
      } else if (message.toLowerCase().includes("email already registered")) {
        message = "This email address is already registered. Please sign in to access your account or use your registered business email.";
      } else if (message.toLowerCase().includes("network error") || err.code === "ERR_NETWORK") {
        message = "Unable to connect to the House of Hackney atelier server. Please verify your connection or ensure the API server is active.";
      }

      await showError("Registration Unsuccessful", message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#d8d5ce] bg-white px-4 py-3 text-sm text-[#171713] placeholder-[#88857d] outline-none transition focus:border-[#394132] focus:ring-1 focus:ring-[#394132]";

  return (
    <main className="min-h-screen bg-[#f6f3ec] text-[#171713] px-4 py-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        {/* Navigation Breadcrumb / Tag */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs tracking-wider uppercase">
          <Link
            to="/trade"
            className="text-[#4a5240] hover:text-[#171713] transition font-medium flex items-center gap-1.5"
          >
            ← Back to Trade Overview
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[#77746c]">Already a registered partner?</span>
            <Link
              to="/trade/login"
              className="font-semibold text-[#394132] underline hover:text-black transition"
            >
              Trade Login
            </Link>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Brand & Programme Perks */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-[#ede9e1] bg-white p-7 sm:p-9 shadow-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c29b38]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[2px] text-[#8a681c] border border-[#c29b38]/30">
                <Sparkles size={13} />
                B2B Professional Atelier
              </span>

              <h1 className="mt-4 font-serif text-3xl sm:text-4xl text-[#171713] leading-tight">
                Apply for House of Hackney Trade Account
              </h1>

              <p className="mt-3 text-xs sm:text-sm text-[#66645e] leading-relaxed">
                Join an international network of premier interior designers, architects, and luxury
                hospitality specifiers with commercial pricing, bespoke scale alterations, and
                priority dispatch.
              </p>

              <hr className="my-6 border-[#ede9e1]" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-[#faf8f4] p-2 text-[#394132] border border-[#ede9e1] shrink-0">
                    <Award size={18} />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-[#171713]">
                      Tiered Wholesale Pricing
                    </h4>
                    <p className="text-xs text-[#77746c] mt-0.5">
                      15% to 25% commercial discounts across wallpapers, velvets, fabrics & accessories.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-[#faf8f4] p-2 text-[#394132] border border-[#ede9e1] shrink-0">
                    <Gift size={18} />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-[#171713]">
                      Complimentary Large Swatches
                    </h4>
                    <p className="text-xs text-[#77746c] mt-0.5">
                      Priority dispatch of generous memo cuts and samples for client moodboards.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-[#faf8f4] p-2 text-[#394132] border border-[#ede9e1] shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-[#171713]">
                      Dedicated Trade Concierge
                    </h4>
                    <p className="text-xs text-[#77746c] mt-0.5">
                      Direct line to senior design managers in our London atelier for custom sizing and reservations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-[#faf8f4] p-2 text-[#394132] border border-[#ede9e1] shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-[#171713]">
                      Commercial Flame Certifications
                    </h4>
                    <p className="text-xs text-[#77746c] mt-0.5">
                      Contract-grade hospitality flame retardancy coatings and global freight logistics.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Retail Switch Notice */}
            <div className="rounded-2xl border border-[#dedbd4] bg-[#faf8f4] p-5 text-xs text-[#66645e] flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-[#171713]">Looking for retail purchases?</p>
                <p className="text-[11px] mt-0.5">Standard accounts do not require business credentials.</p>
              </div>
              <Link
                to="/register"
                className="shrink-0 rounded-lg border border-[#394132] px-3.5 py-1.5 font-semibold text-[#394132] hover:bg-[#394132] hover:text-white transition-colors uppercase tracking-wider text-[11px]"
              >
                Retail Sign Up
              </Link>
            </div>
          </div>

          {/* Right Column: Application Form */}
          <div className="lg:col-span-7 rounded-3xl border border-[#ede9e1] bg-white p-6 sm:p-9 shadow-sm">
            <div className="mb-6 border-b border-[#ede9e1] pb-5">
              <span className="text-[10px] uppercase font-bold tracking-[2px] text-[#4a5240]">
                Step 1 of 1 • Professional Profile
              </span>
              <h2 className="mt-1 font-serif text-2xl text-[#171713]">
                Studio & Principal Credentials
              </h2>
              <p className="text-xs text-[#77746c] mt-1">
                Enter your commercial contact details for priority account verification.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c] mb-1.5">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g. Eleanor"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c] mb-1.5">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Vance"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c] mb-1.5">
                    Professional Email *
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="studio@interiorpractice.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c] mb-1.5">
                    Studio / Contact Phone *
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      className="w-24 rounded-xl border border-[#d8d5ce] bg-white px-2 py-3 text-xs text-[#171713] outline-none focus:border-[#394132]"
                    >
                      <option value="+44">+44 UK</option>
                      <option value="+1">+1 US</option>
                      <option value="+91">+91 IN</option>
                      <option value="+33">+33 FR</option>
                      <option value="+49">+49 DE</option>
                      <option value="+61">+61 AU</option>
                      <option value="+971">+971 UAE</option>
                    </select>
                    <input
                      type="tel"
                      required
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 7739 3901"
                      className={`flex-1 ${inputClass}`}
                    />
                  </div>
                </div>
              </div>

              {/* Company Name & Business Discipline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c] mb-1.5">
                    Company / Practice Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Hackney Design Atelier Ltd"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c] mb-1.5">
                    Primary Discipline *
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="INTERIOR_DESIGNER">Interior Design Practice</option>
                    <option value="ARCHITECT">Architectural Studio</option>
                    <option value="HOTEL_HOSPITALITY">Boutique Hotel / Hospitality</option>
                    <option value="RETAILER">Design Retailer / Showroom</option>
                    <option value="CONTRACTOR">Commercial Fit-Out / Contractor</option>
                    <option value="OTHER">Other Design Professional</option>
                  </select>
                </div>
              </div>

              {/* Website & Tax/VAT ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c] mb-1.5">
                    Studio Website / Portfolio
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://yourstudio.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c] mb-1.5">
                    VAT / GST / Tax Number
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    placeholder="e.g. GB982341234"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c] mb-1.5">
                    Create Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
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

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c] mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77746c] hover:text-[#171713] cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Inquiries / Project Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c] mb-1.5">
                  Project Inquiries or Requirements (Optional)
                </label>
                <textarea
                  rows={2}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Mention any upcoming commercial projects, sample orders, or scale recolouring requirements..."
                  className={inputClass}
                />
              </div>

              {/* Agreement checkbox */}
              <div className="rounded-xl bg-[#faf8f4] p-4 border border-[#ede9e1]">
                <label className="flex items-start gap-3 cursor-pointer text-xs text-[#55534c]">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="mt-0.5 rounded border-[#d8d5ce] text-[#394132] focus:ring-[#394132]"
                  />
                  <span>
                    I confirm that I am applying on behalf of a legitimate design practice, architectural
                    firm, or commercial business and agree to the{" "}
                    <Link to="/terms" className="underline text-[#394132] font-medium hover:text-black">
                      House of Hackney Trade Terms
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="underline text-[#394132] font-medium hover:text-black">
                      Privacy Policy
                    </Link>.
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#394132] py-4 text-xs font-semibold uppercase tracking-[2px] text-white shadow-md hover:bg-[#282e23] disabled:opacity-50 transition cursor-pointer"
              >
                <span>{loading ? "Submitting Trade Application..." : "Apply For Trade Membership"}</span>
                <ArrowRight size={16} />
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-[#77746c]">
                  Already have an approved Trade Account?{" "}
                </span>
                <Link
                  to="/trade/login"
                  className="text-xs font-semibold uppercase tracking-wider text-[#394132] hover:underline"
                >
                  Sign in to Trade Portal →
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
