import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Check,
  Plane,
  ShoppingBag,
  Coffee,
} from "lucide-react";
import { useAdmin } from "../AdminContext";
import { V14_POINTS_HISTORY } from "./v14Data";
import { showToast } from "../../../utils/sweetAlert";

export default function V14Program() {
  const { theme } = useAdmin();
  const isDark = theme === "dark";
  const [selectedTier, setSelectedTier] = useState("Gold");

  const tierBenefits = {
    Silver: [
      "1.0 point per $1 spent",
      "Standard sample delivery",
      "Email support within 24h",
      "Standard payment terms",
    ],
    Gold: [
      "1.5 points per $1 spent",
      "2 free bespoke sample folios a year",
      "Priority curator chat support",
      "No FX fees up to $5k / month",
    ],
    Platinum: [
      "2.5 points per $1 spent",
      "Unlimited white-glove sampling & courier",
      "Dedicated senior interior curator",
      "Custom Net-60 credit facility",
    ],
  };

  return (
    <div className="space-y-6">
      {/* 1. Header from Video Frame 005 */}
      <div>
        <h1
          className={`text-2xl sm:text-3xl font-sans font-bold tracking-tight ${
            isDark ? "text-[#f2f7f3]" : "text-[#142617]"
          }`}
        >
          Rewards Program
        </h1>
        <p
          className={`text-xs sm:text-sm mt-1 font-sans ${
            isDark ? "text-[#9db3a1]" : "text-[#526956]"
          }`}
        >
          Earn points on every purchase and unlock better perks as you climb
          tiers.
        </p>
      </div>

      {/* 2. Top Row: Hero Points Card (Left) & Tier Benefits (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Hero Card: Vibrant Botanical Light Green Gradient from Video */}
        <div className="lg:col-span-7 p-7 rounded-3xl bg-gradient-to-br from-[#38744b] via-[#48875b] to-[#5e9b70] text-white flex flex-col justify-between shadow-md">
          {/* Top row */}
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md font-semibold">
              <Star size={13} className="fill-current text-amber-300" />
              Gold member
            </span>
            <span className="text-white/85 font-medium">
              Member since March 2021
            </span>
          </div>

          {/* Points Counter */}
          <div className="my-6">
            <h2 className="text-4xl sm:text-5xl font-sans font-bold tracking-tight">
              11,641{" "}
              <span className="text-xl sm:text-2xl font-normal opacity-90">
                points
              </span>
            </h2>

            {/* Striped Progress Bar in Light Green & White from Video */}
            <div className="mt-4">
              <div className="w-full h-3 rounded-full bg-black/15 overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "68%" }}
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full"
                  style={{
                    background:
                      "repeating-linear-gradient(-45deg, #ffffff, #ffffff 6px, rgba(255,255,255,0.6) 6px, rgba(255,255,255,0.6) 12px)",
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs mt-2 font-medium">
                <span>Gold</span>
                <span>7,520 pts to Platinum</span>
              </div>
            </div>
          </div>

          {/* Action Button: Redeem Points (Crisp White Button on Green) */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => showToast("Redeeming points for $125 voucher...")}
              className="px-5 py-2.5 rounded-full bg-white text-[#20492c] text-xs font-sans font-bold hover:bg-white/90 transition-colors shadow-sm"
            >
              Redeem points
            </button>
            <span className="text-xs text-white/90 font-medium">
              = $125 in rewards
            </span>
          </div>
        </div>

        {/* Right Card: Tier Benefits from Video */}
        <div
          className={`lg:col-span-5 p-7 rounded-3xl border flex flex-col justify-between transition-all duration-200 shadow-sm ${
            isDark
              ? "bg-[#18231a] border-[#293a2c] text-[#f2f7f3]"
              : "bg-white border-[#e2ece5] text-[#142617]"
          }`}
        >
          <div>
            <h3
              className={`font-sans font-bold text-base ${
                isDark ? "text-[#f2f7f3]" : "text-[#142617]"
              }`}
            >
              Tier benefits
            </h3>

            {/* Tier Switcher Pills with Framer Motion Smooth Sliding Pill */}
            <div
              className={`flex items-center p-1 rounded-full border my-4 ${
                isDark
                  ? "bg-[#141a15] border-[#253327]"
                  : "bg-[#f5f9f6] border-[#d8e6dc]"
              }`}
            >
              {["Silver", "Gold", "Platinum"].map((tier) => {
                const isSelected = selectedTier === tier;
                return (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={`relative flex-1 py-1.5 text-xs font-sans rounded-full transition-colors select-none ${
                      isSelected
                        ? "text-white font-bold"
                        : isDark
                        ? "text-[#9db3a1] hover:text-white"
                        : "text-[#526956] hover:text-[#142617]"
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="activeTierTabPill"
                        className="absolute inset-0 rounded-full bg-[#3e7b52] shadow-sm shadow-[#3e7b52]/30"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{tier}</span>
                  </button>
                );
              })}
            </div>

            {/* Benefits Checklist with Smooth AnimatePresence */}
            <AnimatePresence mode="wait">
              <motion.ul
                key={selectedTier}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-2.5 text-xs font-sans"
              >
                {tierBenefits[selectedTier].map((b, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#eaf5ed] text-[#2e6d3f] flex-shrink-0">
                      <Check size={11} className="stroke-[3]" />
                    </span>
                    <span className={isDark ? "text-[#f2f7f3]" : "text-[#142617]"}>
                      {b}
                    </span>
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>

          <div
            className={`pt-4 border-t border-current/10 text-[11px] font-sans ${
              isDark ? "text-[#9db3a1]" : "text-[#526956]"
            }`}
          >
            {selectedTier === "Gold"
              ? "This is your current tier."
              : `Upgrade to unlock ${selectedTier} benefits.`}
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Offers for You (Left) & Points History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Offers for You */}
        <div
          className={`lg:col-span-7 p-7 rounded-3xl border transition-all duration-200 shadow-sm ${
            isDark
              ? "bg-[#18231a] border-[#293a2c] text-[#f2f7f3]"
              : "bg-white border-[#e2ece5] text-[#142617]"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3
                className={`font-sans font-bold text-base ${
                  isDark ? "text-[#f2f7f3]" : "text-[#142617]"
                }`}
              >
                Offers for you
              </h3>
              <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-[#eaf5ed] text-[#285735]">
                2 active
              </span>
            </div>
          </div>
          <p
            className={`text-xs mb-5 ${
              isDark ? "text-[#9db3a1]" : "text-[#526956]"
            }`}
          >
            Activate an offer and it applies to your next eligible payment.
          </p>

          {/* 3 Offer Cards (Light Green and White - NO BLACK!) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Offer 1 */}
            <div
              className={`p-4 rounded-2xl border flex flex-col justify-between ${
                isDark
                  ? "bg-[#141a15] border-[#253327]"
                  : "bg-[#fcfdfc] border-[#e2ece5]"
              }`}
            >
              <div>
                <div className="w-8 h-8 rounded-full bg-[#eaf5ed] text-[#2e6d3f] flex items-center justify-center mb-3">
                  <Plane size={15} />
                </div>
                <h4
                  className={`font-sans font-bold text-xs leading-snug ${
                    isDark ? "text-[#f2f7f3]" : "text-[#142617]"
                  }`}
                >
                  5% back on flights
                </h4>
                <p
                  className={`text-[10px] mt-1 leading-snug ${
                    isDark ? "text-[#9db3a1]" : "text-[#526956]"
                  }`}
                >
                  Book with any airline using your Vertix card.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-current/10">
                <span
                  className={`text-[9px] block mb-2 ${
                    isDark ? "text-[#7f9183]" : "text-[#7b9180]"
                  }`}
                >
                  Ends 30 Apr
                </span>
                <button className="w-full py-1.5 rounded-full bg-[#eaf5ed] text-[#285735] border border-[#cce3d2] text-[10px] font-sans font-bold">
                  ✓ Activated
                </button>
              </div>
            </div>

            {/* Offer 2 */}
            <div
              className={`p-4 rounded-2xl border flex flex-col justify-between ${
                isDark
                  ? "bg-[#141a15] border-[#253327]"
                  : "bg-[#fcfdfc] border-[#e2ece5]"
              }`}
            >
              <div>
                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
                  <ShoppingBag size={15} />
                </div>
                <h4
                  className={`font-sans font-bold text-xs leading-snug ${
                    isDark ? "text-[#f2f7f3]" : "text-[#142617]"
                  }`}
                >
                  2x points on groceries
                </h4>
                <p
                  className={`text-[10px] mt-1 leading-snug ${
                    isDark ? "text-[#9db3a1]" : "text-[#526956]"
                  }`}
                >
                  Every grocery purchase earns double points.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-current/10">
                <span
                  className={`text-[9px] block mb-2 ${
                    isDark ? "text-[#7f9183]" : "text-[#7b9180]"
                  }`}
                >
                  Ends 15 May
                </span>
                <button
                  onClick={() => showToast("Offer activated!")}
                  className="w-full py-1.5 rounded-full bg-[#3e7b52] hover:bg-[#346945] text-white text-[10px] font-sans font-bold transition-colors shadow-sm"
                >
                  Activate
                </button>
              </div>
            </div>

            {/* Offer 3 */}
            <div
              className={`p-4 rounded-2xl border flex flex-col justify-between ${
                isDark
                  ? "bg-[#141a15] border-[#253327]"
                  : "bg-[#fcfdfc] border-[#e2ece5]"
              }`}
            >
              <div>
                <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3">
                  <Coffee size={15} />
                </div>
                <h4
                  className={`font-sans font-bold text-xs leading-snug ${
                    isDark ? "text-[#f2f7f3]" : "text-[#142617]"
                  }`}
                >
                  Free coffee on Fridays
                </h4>
                <p
                  className={`text-[10px] mt-1 leading-snug ${
                    isDark ? "text-[#9db3a1]" : "text-[#526956]"
                  }`}
                >
                  One drink on us at partner cafés every week.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-current/10">
                <span
                  className={`text-[9px] block mb-2 ${
                    isDark ? "text-[#7f9183]" : "text-[#7b9180]"
                  }`}
                >
                  Ongoing
                </span>
                <button
                  onClick={() => showToast("Offer activated!")}
                  className="w-full py-1.5 rounded-full bg-[#3e7b52] hover:bg-[#346945] text-white text-[10px] font-sans font-bold transition-colors shadow-sm"
                >
                  Activate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Points History from Video */}
        <div
          className={`lg:col-span-5 p-7 rounded-3xl border transition-all duration-200 shadow-sm ${
            isDark
              ? "bg-[#18231a] border-[#293a2c] text-[#f2f7f3]"
              : "bg-white border-[#e2ece5] text-[#142617]"
          }`}
        >
          <h3
            className={`font-sans font-bold text-base mb-4 ${
              isDark ? "text-[#f2f7f3]" : "text-[#142617]"
            }`}
          >
            Points history
          </h3>

          <div className="space-y-3">
            {V14_POINTS_HISTORY.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                  isDark
                    ? "bg-[#141a15] border-[#253327]"
                    : "bg-[#fcfdfc] border-[#e2ece5]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#eaf5ed] text-[#2e6d3f] flex items-center justify-center">
                    <Star size={13} />
                  </div>
                  <div>
                    <h5
                      className={`font-sans font-bold text-xs ${
                        isDark ? "text-[#f2f7f3]" : "text-[#142617]"
                      }`}
                    >
                      {item.title}
                    </h5>
                    <span
                      className={`text-[10px] ${
                        isDark ? "text-[#9db3a1]" : "text-[#526956]"
                      }`}
                    >
                      {item.date}
                    </span>
                  </div>
                </div>

                <span
                  className={`font-mono font-bold text-xs ${
                    item.isPositive ? "text-[#2e6d3f]" : "text-rose-500"
                  }`}
                >
                  {item.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
