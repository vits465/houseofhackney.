import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Award,
  Crown,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Truck,
  Users,
  ChevronRight,
  Check,
} from "lucide-react";
import { useAdmin } from "../../AdminContext";
import { showSuccess, showToast } from "../../../../utils/sweetAlert";

const ALL_TIERS_CONFIG = [
  {
    id: "tier_bronze",
    name: "BRONZE",
    level: 1,
    displayName: "Tier 1: Trade Bronze",
    shortName: "Bronze",
    discountPercentage: 15,
    creditLimit: 10000,
    paymentTerm: "IMMEDIATE",
    freeShipping: false,
    prioritySupport: false,
    annualSpendTarget: "Standard",
    icon: Award,
    description: "Standard design trade privileges across wallpapers, fabrics, and paint.",
    features: [
      "15% Wholesale margin across all collections",
      "Standard trade sample swatches on demand",
      "High-res digital spec sheets & CAD 3D textures",
      "Direct checkout with immediate card / wire settlement",
    ],
  },
  {
    id: "tier_silver",
    name: "SILVER",
    level: 2,
    displayName: "Tier 2: Trade Silver",
    shortName: "Silver",
    discountPercentage: 20,
    creditLimit: 25000,
    paymentTerm: "NET_15",
    freeShipping: false,
    prioritySupport: false,
    annualSpendTarget: "£5,000+ / yr",
    icon: Award,
    description: "For active design studios with recurring residential & hospitality projects.",
    features: [
      "20% Wholesale margin across all collections",
      "Full memo sample library delivered complimentary",
      "Priority 48hr warehouse dispatch reserves",
      "NET_15 credit line invoicing with £25,000 limit",
    ],
  },
  {
    id: "tier_gold",
    name: "GOLD",
    level: 3,
    displayName: "Tier 3: Trade Gold",
    shortName: "Gold",
    discountPercentage: 25,
    creditLimit: 50000,
    paymentTerm: "NET_30",
    freeShipping: true,
    prioritySupport: true,
    annualSpendTarget: "£25,000+ / yr",
    icon: Crown,
    description: "Prestige tier for global commercial and luxury residential projects.",
    features: [
      "25% Wholesale margin across all collections",
      "Complimentary Full-Width Wallpaper & Memo Fabric Samples",
      "Dedicated Senior Atelier Account Concierge (London)",
      "Bespoke recolouring and commercial fire certification support",
      "NET_30 credit line invoicing with £50,000 limit",
      "Complimentary priority courier shipping on all orders",
    ],
  },
  {
    id: "tier_platinum",
    name: "PLATINUM",
    level: 4,
    displayName: "Tier 4: Master Atelier Platinum",
    shortName: "Platinum",
    discountPercentage: 30,
    creditLimit: 100000,
    paymentTerm: "NET_60",
    freeShipping: true,
    prioritySupport: true,
    annualSpendTarget: "£75,000+ / yr",
    icon: Sparkles,
    description: "Elite tier for premier international architectural firms and luxury developers.",
    features: [
      "30% Highest Wholesale Margin on all bespoke orders",
      "Unlimited Complimentary Sample Books & Fabric Ring Swatches",
      "Executive Atelier Director Concierge & Custom Pattern Development",
      "Comprehensive Commercial Fire & Marine Safety Certifications",
      "NET_60 extended credit lines with £100,000 limit",
      "Worldwide Express White-Glove Courier Delivery",
      "Exclusive Annual House of Hackney Masterclass & Private Salons",
    ],
  },
];

export default function UpgradeTierModal({ isOpen, onClose }) {
  const { theme, tradeProfile, tradeCredit, tradeTiers, upgradeTier } = useAdmin();
  const isDark = theme === "dark";

  const currentTier = tradeProfile?.tier || {
    name: "GOLD",
    displayName: "Tier 3: Trade Gold",
    discountPercentage: 25,
    creditLimit: 50000,
    paymentTerm: "NET_30",
  };

  const currentTierName = (currentTier.name || "GOLD").toUpperCase();
  const currentTierIndex = ALL_TIERS_CONFIG.findIndex(
    (t) => t.name === currentTierName
  );

  // Default target tier is the next higher tier, or Platinum if already Gold/Platinum
  const [selectedTier, setSelectedTier] = useState(() => {
    if (currentTierIndex >= 0 && currentTierIndex < ALL_TIERS_CONFIG.length - 1) {
      return ALL_TIERS_CONFIG[currentTierIndex + 1];
    }
    return ALL_TIERS_CONFIG[ALL_TIERS_CONFIG.length - 1];
  });

  const [projectSpend, setProjectSpend] = useState("£50,000 - £100,000");
  const [sector, setSector] = useState("Luxury Residential");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectTier = (t) => {
    setSelectedTier(t);
  };

  const handleConfirmUpgrade = async () => {
    try {
      setIsSubmitting(true);
      const upgraded = await upgradeTier(selectedTier.name, {
        projectSpend,
        sector,
        notes: notes.trim() || `Upgrade to ${selectedTier.displayName}`,
      });

      await showSuccess(
        "Membership Tier Upgraded!",
        `Congratulations! Your trade account has been successfully upgraded to ${upgraded.displayName || selectedTier.displayName}. Your new ${upgraded.discountPercentage}% wholesale margin and ${upgraded.paymentTerm} payment terms are active immediately.`
      );

      onClose();
    } catch (err) {
      showToast("Upgrade failed: " + (err.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCurrentActive = selectedTier.name === currentTierName;
  const isUpgrade = selectedTier.discountPercentage > (currentTier.discountPercentage || 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className={`relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl z-10 flex flex-col ${
            isDark
              ? "bg-[#141c15] border-[#293d2c] text-[#f2f7f3]"
              : "bg-white border-[#dce8df] text-[#142617]"
          }`}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-inherit sticky top-0 bg-inherit z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2a5b36] to-[#4e8d64] text-white flex items-center justify-center shadow-md shadow-[#3e7b52]/20">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  Upgrade Trade Membership Tier
                </h2>
                <p className="text-xs text-[#627766] mt-0.5">
                  Unlock greater wholesale margins, higher credit lines, and extended payment terms
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`p-2 rounded-full border transition-colors ${
                isDark
                  ? "border-[#2b3d2e] hover:bg-[#1d271f] text-[#9db3a1]"
                  : "border-[#dce8df] hover:bg-[#f2f7f3] text-[#556957]"
              }`}
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Current Active Status Pill */}
            <div
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark
                  ? "bg-[#1a261c] border-[#283b2a]"
                  : "bg-[#edf6f0] border-[#d4e6d7]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#3e7b52] text-white flex items-center justify-center">
                  <Award size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#3e7b52]">
                      Currently Active
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3e7b52] text-white">
                      Active Patron
                    </span>
                  </div>
                  <h3 className="font-bold text-sm tracking-tight">
                    {currentTier.displayName || currentTier.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <div>
                  <span className="text-[10px] text-[#627766] block">Wholesale Margin</span>
                  <strong className="text-[#3e7b52] font-mono text-sm">
                    {currentTier.discountPercentage}% OFF
                  </strong>
                </div>
                <div className="h-6 w-px bg-inherit" />
                <div>
                  <span className="text-[10px] text-[#627766] block">Credit Line</span>
                  <strong className="font-mono text-sm">
                    £{Number(tradeCredit?.totalCredit || currentTier.creditLimit || 50000).toLocaleString()}
                  </strong>
                </div>
                <div className="h-6 w-px bg-inherit" />
                <div>
                  <span className="text-[10px] text-[#627766] block">Payment Terms</span>
                  <strong className="font-mono text-sm">
                    {currentTier.paymentTerm || tradeCredit?.paymentTerm || "NET_30"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Tier Comparison Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs uppercase font-bold text-[#627766] tracking-wider">
                  Available Membership Tiers
                </h4>
                <span className="text-xs text-[#3e7b52] font-semibold">
                  Select a tier below to view details and upgrade
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {ALL_TIERS_CONFIG.map((t) => {
                  const isCurrent = t.name === currentTierName;
                  const isSelected = selectedTier.name === t.name;
                  const Icon = t.icon;

                  return (
                    <div
                      key={t.id}
                      onClick={() => handleSelectTier(t)}
                      className={`relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? "border-[#3e7b52] ring-2 ring-[#3e7b52]/30 shadow-md " +
                            (isDark ? "bg-[#1c291e]" : "bg-[#f3f9f4]")
                          : isDark
                          ? "bg-[#172118] border-[#253627] hover:border-[#37523a]"
                          : "bg-white border-[#e0ece2] hover:border-[#b4d4bb]"
                      }`}
                    >
                      {/* Top Badges */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold ${
                              isSelected
                                ? "bg-[#3e7b52] text-white"
                                : isDark
                                ? "bg-[#253627] text-[#9eb6a2]"
                                : "bg-[#edf6f0] text-[#3e7b52]"
                            }`}
                          >
                            Tier {t.level}
                          </span>

                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#3e7b52] text-white">
                              <Check size={10} /> Active
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-1">
                          <Icon size={16} className="text-[#3e7b52]" />
                          <h5 className="font-bold text-sm tracking-tight">
                            {t.shortName}
                          </h5>
                        </div>

                        <div className="my-2.5">
                          <span className="text-2xl font-serif font-bold text-[#142617] dark:text-[#f2f7f3]">
                            {t.discountPercentage}%
                          </span>
                          <span className="text-[11px] font-medium text-[#627766] ml-1">
                            Margin OFF
                          </span>
                        </div>

                        <div className="space-y-1 text-[11px] py-2 border-t border-inherit">
                          <div className="flex justify-between">
                            <span className="text-[#627766]">Credit Line:</span>
                            <span className="font-mono font-bold">
                              £{t.creditLimit.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#627766]">Terms:</span>
                            <span className="font-mono font-bold">{t.paymentTerm}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#627766]">Shipping:</span>
                            <span className="font-medium text-[#3e7b52]">
                              {t.freeShipping ? "Free Delivery" : "Standard"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Select indicator */}
                      <button
                        type="button"
                        className={`w-full mt-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? "bg-[#3e7b52] text-white"
                            : isDark
                            ? "bg-[#233325] text-[#b8d1bc] hover:bg-[#2e4331]"
                            : "bg-[#edf6f0] text-[#2e623f] hover:bg-[#e2f1e6]"
                        }`}
                      >
                        {isCurrent ? "Active Tier" : isSelected ? "Selected" : "Select Tier"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Tier Feature Breakdown & Upgrade Application */}
            <div
              className={`p-5 rounded-2xl border transition-colors ${
                isDark ? "bg-[#182319] border-[#293d2c]" : "bg-[#f8fbf9] border-[#dce8df]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-inherit">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#3e7b52] block">
                    Target Tier Selected
                  </span>
                  <h4 className="text-base font-bold tracking-tight">
                    {selectedTier.displayName}
                  </h4>
                  <p className="text-xs text-[#627766] mt-0.5">
                    {selectedTier.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-[#3e7b52]/15 text-[#3e7b52] font-bold text-xs text-center">
                    <span className="block text-[9px] uppercase tracking-wider font-semibold">Margin</span>
                    {selectedTier.discountPercentage}% OFF
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-[#3e7b52]/15 text-[#3e7b52] font-bold text-xs text-center">
                    <span className="block text-[9px] uppercase tracking-wider font-semibold">Credit</span>
                    £{selectedTier.creditLimit.toLocaleString()}
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-[#3e7b52]/15 text-[#3e7b52] font-bold text-xs text-center">
                    <span className="block text-[9px] uppercase tracking-wider font-semibold">Terms</span>
                    {selectedTier.paymentTerm}
                  </div>
                </div>
              </div>

              {/* Privileges List */}
              <div className="py-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#627766] block mb-2.5">
                  Tier Privileges & Benefits:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedTier.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-[#3e7b52] shrink-0 mt-0.5" />
                      <span className="text-[#556957] dark:text-[#a2b8a6] leading-relaxed">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Form Inputs */}
              {!isCurrentActive && (
                <div className="pt-4 border-t border-inherit space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#627766] block">
                    Upgrade Verification Details
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#627766] mb-1">
                        Estimated Annual Project Spend
                      </label>
                      <select
                        value={projectSpend}
                        onChange={(e) => setProjectSpend(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                          isDark
                            ? "bg-[#1f2c20] border-[#2f4432] text-white"
                            : "bg-white border-[#d8e6dc] text-[#142617]"
                        }`}
                      >
                        <option value="£10,000 - £25,000">£10,000 - £25,000 / year</option>
                        <option value="£25,000 - £50,000">£25,000 - £50,000 / year</option>
                        <option value="£50,000 - £100,000">£50,000 - £100,000 / year</option>
                        <option value="£100,000+">£100,000+ / year (Commercial & Enterprise)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#627766] mb-1">
                        Primary Project Focus
                      </label>
                      <select
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                          isDark
                            ? "bg-[#1f2c20] border-[#2f4432] text-white"
                            : "bg-white border-[#d8e6dc] text-[#142617]"
                        }`}
                      >
                        <option value="Luxury Residential">Luxury Residential</option>
                        <option value="Boutique Hospitality">Boutique Hospitality & Hotel</option>
                        <option value="Commercial & Retail">Commercial & Luxury Retail</option>
                        <option value="Superyacht & Marine">Superyacht & Marine Interiors</option>
                        <option value="Heritage Architectural Restoration">Heritage Architectural Restoration</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#627766] mb-1">
                        Notes for Atelier Concierge (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Specifying upcoming 45-room boutique hotel in London requiring NET_60 and 30% margin..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                          isDark
                            ? "bg-[#1f2c20] border-[#2f4432] text-white placeholder-[#58735d]"
                            : "bg-white border-[#d8e6dc] text-[#142617] placeholder-[#8ea392]"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-t border-inherit bg-inherit sticky bottom-0 z-20">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-full border text-xs font-semibold transition-colors ${
                isDark
                  ? "border-[#2b3d2e] hover:bg-[#1d271f] text-[#9db3a1]"
                  : "border-[#dce8df] hover:bg-[#f2f7f3] text-[#556957]"
              }`}
            >
              Cancel
            </button>

            {isCurrentActive ? (
              <span className="text-xs font-semibold text-[#3e7b52] flex items-center gap-1.5">
                <Check size={14} /> You are currently at this tier
              </span>
            ) : (
              <button
                onClick={handleConfirmUpgrade}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#2a5b36] via-[#3e7b52] to-[#4e8d64] hover:opacity-95 text-white font-semibold text-xs shadow-md shadow-[#3e7b52]/20 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Upgrading Atelier Tier...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Confirm & Upgrade to {selectedTier.shortName}
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

