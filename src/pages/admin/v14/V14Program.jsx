import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Check,
  ShoppingBag,
  Sparkles,
  Gift,
  Compass,
} from "lucide-react";
import { useAdmin } from "../AdminContext";
import { showToast } from "../../../utils/sweetAlert";

export default function V14Program() {
  const { theme, orders, authUser } = useAdmin();
  const isDark = theme === "dark";

  // Calculate live points accumulated from all verified orders
  const totalPoints = useMemo(() => {
    const pts = (orders || []).reduce((sum, ord) => {
      const amt = Number(ord.totalAmount || ord.grandTotal || ord.totalPrice || ord.total) || 0;
      return sum + Math.round(amt);
    }, 0);
    return Math.max(pts, 120);
  }, [orders]);

  // Determine tier
  const currentTier = useMemo(() => {
    if (totalPoints >= 15000) return "Platinum";
    if (totalPoints >= 5000) return "Gold";
    return "Silver";
  }, [totalPoints]);

  const [selectedTier, setSelectedTier] = useState(currentTier);

  const tierTarget = currentTier === "Silver" ? 5000 : currentTier === "Gold" ? 15000 : 25000;
  const progressPct = Math.min(Math.round((totalPoints / tierTarget) * 100), 100);
  const ptsToNext = Math.max(tierTarget - totalPoints, 0);

  const tierBenefits = {
    Silver: [
      "1.0 point per £1 spent across atelier boutique",
      "Standard White Glove swatch & sample delivery",
      "Email curator concierge within 24 hours",
      "Standard white-label invoices",
    ],
    Gold: [
      "1.5 points per £1 spent across atelier boutique",
      "2 complimentary bespoke sample folios per quarter",
      "Priority curator WhatsApp & direct phone concierge",
      "Zero foreign exchange fees on international commissions",
    ],
    Platinum: [
      "2.5 points per £1 spent across atelier boutique",
      "Unlimited white-glove sampling & courier delivery",
      "Dedicated senior London interior stylist concierge",
      "Custom Net-60 credit facility & private preview access",
    ],
  };

  // Dynamic Points History derived from live orders
  const dynamicHistory = useMemo(() => {
    if (!orders || orders.length === 0) {
      return [
        {
          id: "PTS-WELCOME",
          title: "Atelier Membership Welcome Grant",
          date: "Account Created",
          points: "+120",
          isPositive: true,
        },
      ];
    }
    return orders.map((ord, idx) => {
      const amt = Number(ord.totalAmount || ord.grandTotal || ord.totalPrice || ord.total) || 0;
      const pts = Math.round(amt);
      const itemName = ord.items?.[0]?.product?.name || ord.items?.[0]?.name || `Order ${ord.orderNumber || idx + 1}`;
      const dateFormatted = ord.createdAt
        ? new Date(ord.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
        : "Recent";

      return {
        id: `PTS-${ord._id?.slice(-4) || idx}`,
        title: `${itemName} Commission`,
        date: dateFormatted,
        points: `+${pts.toLocaleString()}`,
        isPositive: true,
      };
    });
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h1
          className={`text-2xl sm:text-3xl font-sans font-bold tracking-tight ${
            isDark ? "text-[#f2f7f3]" : "text-[#142617]"
          }`}
        >
          Rewards & Patron Privileges
        </h1>
        <p
          className={`text-xs sm:text-sm mt-1 font-sans ${
            isDark ? "text-[#9db3a1]" : "text-[#526956]"
          }`}
        >
          Dynamic rewards calculated in real time from live orders ({totalPoints.toLocaleString()} points earned).
        </p>
      </div>

      {/* top : hero points card  & tier benefits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Hero Card: Botanical Gradient */}
        <div className="lg:col-span-7 p-7 rounded-3xl bg-gradient-to-br from-[#2e5e3a] via-[#3e7b52] to-[#559a68] text-white flex flex-col justify-between shadow-md">
          {/* Top row */}
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md font-semibold">
              <Star size={13} className="fill-current text-amber-300" />
              {currentTier} Atelier Member
            </span>
            <span className="text-white/85 font-medium">
              Real-time Database Telemetry
            </span>
          </div>

          {/* Points Counter */}
          <div className="my-6">
            <h2 className="text-4xl sm:text-5xl font-sans font-bold tracking-tight">
              {totalPoints.toLocaleString()}{" "}
              <span className="text-xl sm:text-2xl font-normal opacity-90">
                points
              </span>
            </h2>

            {/* Striped Progress Bar */}
            <div className="mt-4">
              <div className="w-full h-3 rounded-full bg-black/15 overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full"
                  style={{
                    background:
                      "repeating-linear-gradient(-45deg, #ffffff, #ffffff 6px, rgba(255,255,255,0.6) 6px, rgba(255,255,255,0.6) 12px)",
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs mt-2 font-medium">
                <span>{currentTier} Tier</span>
                <span>
                  {ptsToNext > 0 ? `${ptsToNext.toLocaleString()} pts to next tier` : "Top VIP Patron"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button: Redeem Points */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => showToast(`Redeeming points for £${Math.round(totalPoints * 0.01)} atelier credit...`)}
              className="px-5 py-2.5 rounded-full bg-white text-[#20492c] text-xs font-sans font-bold hover:bg-white/90 transition-colors shadow-sm"
            >
              Redeem Atelier Credit
            </button>
            <span className="text-xs text-white/90 font-medium">
              = £{Math.round(totalPoints * 0.01).toLocaleString()} in boutique rewards
            </span>
          </div>
        </div>

        {/* Right Card: Tier Benefits */}
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
              Tier Benefits & Privileges
            </h3>

            {/* Tier Switcher Pills */}
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
                      <motion.div
                        layoutId="tierPill"
                        className="absolute inset-0 bg-[#3e7b52] rounded-full -z-10 shadow-xs"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    {tier}
                  </button>
                );
              })}
            </div>

            {/* Benefits List */}
            <div className="space-y-2.5">
              {tierBenefits[selectedTier].map((benefit, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs font-sans">
                  <div className="w-4 h-4 rounded-full bg-[#eaf5ed] text-[#2e6d3f] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={11} className="stroke-[3]" />
                  </div>
                  <span className={isDark ? "text-[#d1ded4]" : "text-[#334637]"}>
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`mt-4 pt-3 border-t text-[11px] font-sans ${
              isDark ? "border-[#293a2c] text-[#7f9183]" : "border-[#edf4ee] text-[#7b9180]"
            }`}
          >
            {selectedTier === currentTier
              ? "This is your currently active atelier tier."
              : `Earn points through commissions to unlock ${selectedTier} benefits.`}
          </div>
        </div>
      </div>

      {/* offers & points history */}
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
                Curated Atelier Privileges
              </h3>
              <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-[#eaf5ed] text-[#285735]">
                3 Active
              </span>
            </div>
          </div>
          <p
            className={`text-xs mb-5 ${
              isDark ? "text-[#9db3a1]" : "text-[#526956]"
            }`}
          >
            Exclusive British craftsmanship incentives applied directly at checkout.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Offer 1 */}
            <div
              className={`p-4 rounded-2xl border flex flex-col justify-between ${
                isDark ? "bg-[#141a15] border-[#253327]" : "bg-[#fcfdfc] border-[#e2ece5]"
              }`}
            >
              <div>
                <div className="w-8 h-8 rounded-full bg-[#eaf5ed] text-[#2e6d3f] flex items-center justify-center mb-3">
                  <Sparkles size={15} />
                </div>
                <h4
                  className={`font-sans font-bold text-xs leading-snug ${
                    isDark ? "text-[#f2f7f3]" : "text-[#142617]"
                  }`}
                >
                  10% Velvet Privileges
                </h4>
                <p
                  className={`text-[10px] mt-1 leading-snug ${
                    isDark ? "text-[#9db3a1]" : "text-[#526956]"
                  }`}
                >
                  Applied on all British archival velvet upholstery rolls.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-current/10">
                <span className={`text-[9px] block mb-2 ${isDark ? "text-[#7f9183]" : "text-[#7b9180]"}`}>
                  Active Privilege
                </span>
                <button
                  onClick={() => showToast("Velvet privilege active for upcoming commissions.")}
                  className="w-full py-1.5 rounded-full bg-[#eaf5ed] text-[#285735] border border-[#cce3d2] text-[10px] font-sans font-bold"
                >
                  ✓ Activated
                </button>
              </div>
            </div>

            {/* Offer 2 */}
            <div
              className={`p-4 rounded-2xl border flex flex-col justify-between ${
                isDark ? "bg-[#141a15] border-[#253327]" : "bg-[#fcfdfc] border-[#e2ece5]"
              }`}
            >
              <div>
                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
                  <Gift size={15} />
                </div>
                <h4
                  className={`font-sans font-bold text-xs leading-snug ${
                    isDark ? "text-[#f2f7f3]" : "text-[#142617]"
                  }`}
                >
                  Complimentary Swatch Folio
                </h4>
                <p
                  className={`text-[10px] mt-1 leading-snug ${
                    isDark ? "text-[#9db3a1]" : "text-[#526956]"
                  }`}
                >
                  Full-width wallpaper and fabric archival samples.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-current/10">
                <span className={`text-[9px] block mb-2 ${isDark ? "text-[#7f9183]" : "text-[#7b9180]"}`}>
                  Quarterly Benefit
                </span>
                <button
                  onClick={() => showToast("Archival sample folio ordered to studio.")}
                  className="w-full py-1.5 rounded-full bg-[#3e7b52] hover:bg-[#346945] text-white text-[10px] font-sans font-bold transition-colors shadow-sm"
                >
                  Order Samples
                </button>
              </div>
            </div>

            {/* Offer 3 */}
            <div
              className={`p-4 rounded-2xl border flex flex-col justify-between ${
                isDark ? "bg-[#141a15] border-[#253327]" : "bg-[#fcfdfc] border-[#e2ece5]"
              }`}
            >
              <div>
                <div className="w-8 h-8 rounded-full bg-[#eaf5ed] text-[#2e6d3f] flex items-center justify-center mb-3">
                  <Compass size={15} />
                </div>
                <h4
                  className={`font-sans font-bold text-xs leading-snug ${
                    isDark ? "text-[#f2f7f3]" : "text-[#142617]"
                  }`}
                >
                  Private Curator Session
                </h4>
                <p
                  className={`text-[10px] mt-1 leading-snug ${
                    isDark ? "text-[#9db3a1]" : "text-[#526956]"
                  }`}
                >
                  Bespoke interior styling consultation in London showroom.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-current/10">
                <span className={`text-[9px] block mb-2 ${isDark ? "text-[#7f9183]" : "text-[#7b9180]"}`}>
                  VIP Access
                </span>
                <button
                  onClick={() => showToast("Consultation booking request sent to concierge.")}
                  className="w-full py-1.5 rounded-full bg-[#3e7b52] hover:bg-[#346945] text-white text-[10px] font-sans font-bold transition-colors shadow-sm"
                >
                  Book Session
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Dynamic Points History from Orders */}
        <div
          className={`lg:col-span-5 p-7 rounded-3xl border transition-all duration-200 shadow-sm ${
            isDark
              ? "bg-[#18231a] border-[#293a2c] text-[#f2f7f3]"
              : "bg-white border-[#e2ece5] text-[#142617]"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`font-sans font-bold text-base ${
                isDark ? "text-[#f2f7f3]" : "text-[#142617]"
              }`}
            >
              Live Points Telemetry
            </h3>
            <span className="text-[10px] font-mono text-[#3e7b52] font-semibold">
              {dynamicHistory.length} ledger events
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto scrollbar-thin pr-1">
            {dynamicHistory.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                  isDark ? "bg-[#141a15] border-[#253327]" : "bg-[#fcfdfc] border-[#e2ece5]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#eaf5ed] text-[#2e6d3f] flex items-center justify-center shrink-0">
                    <Star size={13} />
                  </div>
                  <div className="min-w-0">
                    <h5
                      className={`font-sans font-bold text-xs truncate max-w-[190px] ${
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
                  className={`font-mono font-bold text-xs shrink-0 ${
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
